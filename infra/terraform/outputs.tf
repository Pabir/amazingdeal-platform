output "alb_dns_name" {
  description = "Public DNS name of the Commerce API Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "api_endpoint" {
  description = "Commerce API public base URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_repository_url" {
  description = "Amazon ECR Repository URL for building & pushing commerce-api images"
  value       = aws_ecr_repository.commerce_api.repository_url
}

output "aurora_cluster_endpoint" {
  description = "Aurora PostgreSQL Serverless v2 cluster writer endpoint"
  value       = aws_rds_cluster.aurora.endpoint
}

output "media_cdn_domain" {
  description = "CloudFront Domain Name for media assets (Use in APP_MEDIA_BASE_URL)"
  value       = "https://${aws_cloudfront_distribution.media_cdn.domain_name}"
}

output "media_s3_bucket" {
  description = "Amazon S3 Bucket name for media uploads"
  value       = aws_s3_bucket.media.id
}

output "admin_cdn_domain" {
  description = "CloudFront Domain Name for Merchant Admin Web SPA"
  value       = "https://${aws_cloudfront_distribution.admin_cdn.domain_name}"
}

output "admin_s3_bucket" {
  description = "Amazon S3 Bucket name for uploading admin-web dist/ build files"
  value       = aws_s3_bucket.admin_web.id
}

output "amplify_app_id" {
  description = "AWS Amplify App ID for Next.js Storefront"
  value       = aws_amplify_app.storefront.id
}

output "amplify_default_domain" {
  description = "AWS Amplify default web domain"
  value       = aws_amplify_app.storefront.default_domain
}

output "db_secret_name" {
  description = "AWS Secrets Manager secret name holding the database credentials"
  value       = aws_secretsmanager_secret.db_credentials.name
}
