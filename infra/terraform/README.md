# 🚀 AmazingDeal AWS Enterprise Infrastructure (Terraform)

This Terraform stack provisions the complete **Strategy C: Enterprise AWS** infrastructure for the AmazingDeal Multi-Tenant Commerce Platform in a single automated run.

---

## 🏗️ Resources Provisioned

* **Networking**: Multi-AZ VPC (`10.0.0.0/16`), Public Subnets, Private App Subnets, Isolated DB Subnets, Internet Gateway, NAT Gateway.
* **Security**: Least-privilege Security Groups with strict isolation (ALB -> ECS -> Aurora).
* **Database**: AWS Aurora PostgreSQL Serverless v2 (0.5 to 4.0 ACUs) with auto-generated credentials in AWS Secrets Manager.
* **Backend API**:
  * Amazon ECR Container Registry (`amazingdeal/commerce-api`)
  * Application Load Balancer (ALB) with `/actuator/health` probe
  * AWS ECS Fargate Cluster & Service (Multi-AZ, 2 tasks)
  * IAM Execution & Task Roles
  * CloudWatch Logs
* **Media Tier**: Private Amazon S3 Bucket + CloudFront CDN + Origin Access Control (OAC).
* **Admin Web**: Private Amazon S3 Bucket + CloudFront CDN with React Router SPA error rewrites.
* **Storefront Web**: AWS Amplify Hosting for Next.js 14 App Router SSR.

---

## 📋 Prerequisites

1. **Install Terraform & AWS CLI** (run in PowerShell as Administrator):
   ```powershell
   winget install Hashicorp.Terraform
   winget install Amazon.AWSCLI
   ```

2. **Configure AWS Credentials**:
   ```powershell
   aws configure
   ```
   Provide your `AWS Access Key ID`, `AWS Secret Access Key`, and default region (`us-east-1`).

---

## ⚡ Deployment in 3 Commands

### Step 1: Initialize Terraform
Navigate to this directory:
```powershell
cd infra/terraform
terraform init
```

### Step 2: Review Execution Plan
```powershell
terraform plan
```

### Step 3: Apply Infrastructure
```powershell
terraform apply -auto-approve
```

---

## 🐳 Step 4: Build & Push the Backend Container

Once Terraform completes, it will output your **`ecr_repository_url`**. Build and push the Spring Boot container:

```powershell
# 1. Login Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)

# 2. Build and push image
docker build -t "$(terraform output -raw ecr_repository_url):latest" -f ../../services/commerce-api/Dockerfile ../../services/commerce-api
docker push "$(terraform output -raw ecr_repository_url):latest"

# 3. Force ECS deployment to pick up the fresh image
aws ecs update-service --cluster amazingdeal-cluster-production --service amazingdeal-api-service-production --force-new-deployment --region us-east-1
```

---

## 🖥️ Step 5: Deploy the Merchant Admin Web

Build the Vite SPA pointing to your new ALB endpoint and sync to the S3 bucket:

```powershell
# In repository root:
$env:VITE_API_BASE_URL = "$(terraform output -raw api_endpoint)/api/v1"
pnpm --filter admin-web build

# Sync to S3 Admin Bucket
aws s3 sync apps/admin-web/dist "s3://$(terraform output -raw admin_s3_bucket)" --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id <ADMIN_CLOUDFRONT_ID> --paths "/*"
```

---

## 🧹 Tearing Down (Zero Orphaned Resources)

If you ever need to delete the entire cloud environment to prevent recurring charges:
```powershell
terraform destroy -auto-approve
```
