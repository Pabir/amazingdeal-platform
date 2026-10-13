# 1. ALB Security Group (Internet-Facing)
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-alb-sg-${var.environment}"
  description = "Controls inbound traffic to Commerce API ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-alb-sg-${var.environment}"
  }
}

# 2. ECS Fargate Security Group (Internal to ALB)
resource "aws_security_group" "ecs" {
  name        = "${var.app_name}-ecs-sg-${var.environment}"
  description = "Allows inbound traffic only from the ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow traffic from ALB on container port"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow outbound to internet via NAT (for ECR, Secrets Manager, S3)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-sg-${var.environment}"
  }
}

# 3. Aurora PostgreSQL Security Group (Internal to ECS)
resource "aws_security_group" "aurora" {
  name        = "${var.app_name}-aurora-sg-${var.environment}"
  description = "Allows inbound traffic to Aurora only from ECS containers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow PostgreSQL access from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-aurora-sg-${var.environment}"
  }
}
