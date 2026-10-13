# ==============================================================================
# AWS Amplify Hosting: Buyer Storefront (Next.js 14 SSR Monorepo)
# ==============================================================================
resource "aws_amplify_app" "storefront" {
  name        = "${var.app_name}-storefront-${var.environment}"
  repository  = var.github_repo_url != "" ? var.github_repo_url : null
  access_token = var.github_access_token != "" ? var.github_access_token : null

  # WEB_COMPUTE platform is required for Next.js 14 App Router SSR runtime
  platform = "WEB_COMPUTE"

  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: apps/storefront-web
        frontend:
          phases:
            preBuild:
              commands:
                - corepack enable
                - corepack prepare pnpm@latest --activate
                - pnpm install --frozen-lockfile
            build:
              commands:
                - pnpm run build
          artifacts:
            baseDirectory: .next
            files:
              - '**/*'
          cache:
            paths:
              - .next/cache/**/*
              - node_modules/**/*
              - $(pnpm store path)/**/*
  EOT

  environment_variables = {
    NEXT_PUBLIC_API_URL       = "http://${aws_lb.main.dns_name}/api/v1"
    AMPLIFY_MONOREPO_APP_ROOT = "apps/storefront-web"
  }

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }

  tags = {
    Name = "${var.app_name}-amplify-storefront"
  }
}

# Amplify Branch (Main) - Connected if GitHub repo is provided
resource "aws_amplify_branch" "main" {
  count       = var.github_repo_url != "" ? 1 : 0
  app_id      = aws_amplify_app.storefront.id
  branch_name = "main"

  framework = "Next.js - SSR"
  stage     = "PRODUCTION"
}
