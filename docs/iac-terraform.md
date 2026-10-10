# IaC Skeleton (Terraform)

## Overview

This is a minimal, maintainable Terraform layout for the MVP AWS stack:

- VPC (public + private subnets)
- ALB + ECS Fargate for API
- RDS PostgreSQL
- S3 + CloudFront for SPA
- S3 for uploads
- Cognito for auth
- CloudWatch logs/metrics

## Folder Structure

```
infra/
  envs/
    dev/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
    prod/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
  modules/
    network/
    app/
    database/
    storage/
    auth/
```

## Module Responsibilities

- `network`: VPC, subnets, route tables, NAT, security groups
- `app`: ALB, ECS cluster, ECS service, task definitions, IAM roles
- `database`: RDS Postgres, subnet group, parameter group
- `storage`: S3 buckets (static web + uploads), CloudFront
- `auth`: Cognito user pool + app client

## Example `envs/dev/main.tf`

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source       = "../../modules/network"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

module "storage" {
  source          = "../../modules/storage"
  project_name    = var.project_name
  spa_bucket_name = var.spa_bucket_name
  uploads_bucket  = var.uploads_bucket
}

module "database" {
  source         = "../../modules/database"
  project_name   = var.project_name
  db_name        = var.db_name
  db_username    = var.db_username
  db_password    = var.db_password
  private_subnets = module.network.private_subnets
  vpc_id         = module.network.vpc_id
}

module "auth" {
  source       = "../../modules/auth"
  project_name = var.project_name
}

module "app" {
  source           = "../../modules/app"
  project_name     = var.project_name
  vpc_id           = module.network.vpc_id
  public_subnets   = module.network.public_subnets
  private_subnets  = module.network.private_subnets
  db_endpoint      = module.database.db_endpoint
  uploads_bucket   = module.storage.uploads_bucket
  cognito_pool_id  = module.auth.user_pool_id
}
```

## Variables (example)

```hcl
variable "aws_region" { type = string }
variable "project_name" { type = string }
variable "vpc_cidr" { type = string }
variable "spa_bucket_name" { type = string }
variable "uploads_bucket" { type = string }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string }
```

## Notes

- Keep `dev` and `prod` isolated by state and variables.
- Start with small instance sizes and scale later.
- Add WAF and Redis only when needed.
- Keep API business logic separate from infra to avoid lock-in.
