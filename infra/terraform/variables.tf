variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g. prod, staging)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Base application name for resource prefixes"
  type        = string
  default     = "amazingdeal"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database Variables
variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "amazingdeal_commerce"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "db_min_capacity" {
  description = "Aurora Serverless v2 minimum ACUs (Aurora Capacity Units)"
  type        = number
  default     = 0.5
}

variable "db_max_capacity" {
  description = "Aurora Serverless v2 maximum ACUs"
  type        = number
  default     = 4.0
}

# ECS Backend Variables
variable "backend_cpu" {
  description = "Fargate CPU units (512 = 0.5 vCPU, 1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "backend_memory" {
  description = "Fargate Memory in MiB (1024, 2048, etc.)"
  type        = number
  default     = 2048
}

variable "backend_desired_count" {
  description = "Desired number of running ECS backend tasks across AZs"
  type        = number
  default     = 2
}

variable "container_port" {
  description = "Internal container port for Commerce API"
  type        = number
  default     = 8080
}

# Optional Custom Domain & SSL
variable "domain_name" {
  description = "Optional root domain name (e.g. yourdomain.com). Leave empty to use direct AWS URLs."
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "Optional ACM Certificate ARN for HTTPS listener on ALB (required if using custom domain with HTTPS)"
  type        = string
  default     = ""
}

# Optional Amplify Storefront GitHub Integration
variable "github_repo_url" {
  description = "Optional GitHub repository URL for AWS Amplify Storefront"
  type        = string
  default     = ""
}

variable "github_access_token" {
  description = "Optional GitHub Personal Access Token for AWS Amplify integration"
  type        = string
  default     = ""
  sensitive   = true
}
