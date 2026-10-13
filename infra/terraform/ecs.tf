# ==============================================================================
# Amazon ECR Repository for Commerce API Container Images
# ==============================================================================
resource "aws_ecr_repository" "commerce_api" {
  name                 = "${var.app_name}/commerce-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-ecr-commerce-api"
  }
}

# CloudWatch Logs for ECS Container Logs
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.app_name}-commerce-api"
  retention_in_days = 14

  tags = {
    Name = "${var.app_name}-ecs-log-group"
  }
}

# ==============================================================================
# Secrets Manager: JWT Secret
# ==============================================================================
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.app_name}/${var.environment}/jwt"
  description             = "JWT HMAC Secret Key for AmazingDeal Commerce API"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# ==============================================================================
# IAM Roles for ECS Fargate
# ==============================================================================

# 1. ECS Task Execution Role (Allows agent to pull from ECR & get secrets)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_standard" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Grant execution role access to Secrets Manager
resource "aws_iam_policy" "ecs_secrets_access" {
  name        = "${var.app_name}-ecs-secrets-policy"
  description = "Allows ECS execution role to retrieve DB and JWT secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.jwt_secret.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_secrets" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_access.arn
}

# 2. ECS Task Role (Runtime permissions for Spring Boot to write to S3)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_policy" "ecs_s3_media_access" {
  name        = "${var.app_name}-ecs-s3-media-policy"
  description = "Allows Spring Boot to write uploads to the Media S3 Bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.media.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_s3" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_s3_media_access.arn
}

# ==============================================================================
# Application Load Balancer (ALB)
# ==============================================================================
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.app_name}-alb-${var.environment}"
  }
}

# ALB Target Group for Commerce API
resource "aws_lb_target_group" "api" {
  name        = "${var.app_name}-tg-${var.environment}"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 20
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.app_name}-target-group"
  }
}

# HTTP Listener (Port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # If an HTTPS certificate is given, redirect 80 to 443; otherwise, forward directly to API target group
  default_action {
    type = var.certificate_arn != "" ? "redirect" : "forward"

    dynamic "redirect" {
      for_each = var.certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    target_group_arn = var.certificate_arn == "" ? aws_lb_target_group.api.arn : null
  }
}

# HTTPS Listener (Port 443) - Conditional
resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ==============================================================================
# ECS Fargate Cluster & Service
# ==============================================================================
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.app_name}-ecs-cluster"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "commerce_api" {
  family                   = "${var.app_name}-commerce-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.backend_cpu)
  memory                   = tostring(var.backend_memory)
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "commerce-api"
      image     = "${aws_ecr_repository.commerce_api.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:postgresql://${aws_rds_cluster.aurora.endpoint}:5432/${var.db_name}?sslmode=require" },
        { name = "SPRING_DATASOURCE_USERNAME", value = var.db_username },
        { name = "APP_MEDIA_BASE_URL", value = "https://${aws_cloudfront_distribution.media_cdn.domain_name}" },
        { name = "APP_CORS_ALLOWED_ORIGINS", value = "http://${aws_lb.main.dns_name},https://${aws_cloudfront_distribution.admin_cdn.domain_name}" }
      ]

      secrets = [
        {
          name      = "SPRING_DATASOURCE_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:password::"
        },
        {
          name      = "APP_JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "${var.app_name}-task-definition"
  }
}

# ECS Fargate Service
resource "aws_ecs_service" "commerce_api" {
  name            = "${var.app_name}-api-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.commerce_api.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "commerce-api"
    container_port   = var.container_port
  }

  deployment_controller {
    type = "ECS"
  }

  # Allow external deployments / image updates without overriding task definition diffs
  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [
    aws_lb_listener.http,
    aws_rds_cluster_instance.aurora_primary
  ]

  tags = {
    Name = "${var.app_name}-ecs-service"
  }
}
