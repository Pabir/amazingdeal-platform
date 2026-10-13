# Generate a secure database master password
resource "random_password" "db_master_password" {
  length  = 24
  special = false # Avoid special characters that can break JDBC connection strings
}

# Store Database Credentials in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.app_name}/${var.environment}/database"
  description             = "Aurora PostgreSQL Master Credentials for ${var.app_name}"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.app_name}-db-secret-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    engine   = "postgres"
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    username = var.db_username
    password = random_password.db_master_password.result
    database = var.db_name
    jdbc_url = "jdbc:postgresql://${aws_rds_cluster.aurora.endpoint}:5432/${var.db_name}?sslmode=require"
  })
}

# Aurora PostgreSQL Serverless v2 Cluster
resource "aws_rds_cluster" "aurora" {
  cluster_identifier     = "${var.app_name}-aurora-cluster-${var.environment}"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned" # Required for Serverless v2
  engine_version         = "16.1"
  database_name          = var.db_name
  master_username        = var.db_username
  master_password        = random_password.db_master_password.result
  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.aurora.id]
  storage_encrypted      = true
  skip_final_snapshot    = true
  apply_immediately      = true
  deletion_protection    = false

  serverlessv2_scaling_configuration {
    min_capacity = var.db_min_capacity
    max_capacity = var.db_max_capacity
  }

  tags = {
    Name = "${var.app_name}-aurora-cluster-${var.environment}"
  }
}

# Aurora Serverless v2 Primary Instance
resource "aws_rds_cluster_instance" "aurora_primary" {
  identifier         = "${var.app_name}-aurora-node-1"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
  apply_immediately  = true

  tags = {
    Name = "${var.app_name}-aurora-node-1"
  }
}
