resource "random_id" "suffix" {
  byte_length = 4
}

# ==============================================================================
# 1. MEDIA STORAGE: S3 Bucket + CloudFront CDN + Origin Access Control (OAC)
# ==============================================================================

# Private S3 Bucket for Media Uploads
resource "aws_s3_bucket" "media" {
  bucket        = "${var.app_name}-media-${var.environment}-${random_id.suffix.hex}"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-media-bucket"
  }
}

# Enforce Block Public Access (All reads must route via CloudFront)
resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control for Media
resource "aws_cloudfront_origin_access_control" "media_oac" {
  name                              = "${var.app_name}-media-oac-${var.environment}"
  description                       = "OAC for ${var.app_name} media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for Media CDN
resource "aws_cloudfront_distribution" "media_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.app_name} Global Media CDN"
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id                = "S3-MediaOrigin"
    origin_access_control_id = aws_cloudfront_origin_access_control.media_oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-MediaOrigin"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.app_name}-media-cdn"
  }
}

# S3 Bucket Policy: Grant CloudFront OAC Read Access
resource "aws_s3_bucket_policy" "media_oac_policy" {
  bucket = aws_s3_bucket.media.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOACReadOnly"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.media.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.media_cdn.arn
          }
        }
      }
    ]
  })
}

# ==============================================================================
# 2. ADMIN CONSOLE: S3 Bucket + CloudFront SPA Distribution
# ==============================================================================

# Private S3 Bucket for Admin SPA Static Assets
resource "aws_s3_bucket" "admin_web" {
  bucket        = "${var.app_name}-admin-web-${var.environment}-${random_id.suffix.hex}"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-admin-web-bucket"
  }
}

resource "aws_s3_bucket_public_access_block" "admin_web" {
  bucket = aws_s3_bucket.admin_web.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "admin_oac" {
  name                              = "${var.app_name}-admin-oac-${var.environment}"
  description                       = "OAC for Admin Web SPA"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for Admin Web SPA with React Router rewrites
resource "aws_cloudfront_distribution" "admin_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.app_name} Admin Console SPA"
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.admin_web.bucket_regional_domain_name
    origin_id                = "S3-AdminWebOrigin"
    origin_access_control_id = aws_cloudfront_origin_access_control.admin_oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-AdminWebOrigin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # SPA Routing Rewrites: Return index.html on 403 / 404 with HTTP 200
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.app_name}-admin-cdn"
  }
}

# S3 Bucket Policy: Grant CloudFront OAC Read Access for Admin
resource "aws_s3_bucket_policy" "admin_oac_policy" {
  bucket = aws_s3_bucket.admin_web.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAdminOACReadOnly"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.admin_web.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.admin_cdn.arn
          }
        }
      }
    ]
  })
}
