pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        ECR_REGISTRY    = '434748505869.dkr.ecr.ap-south-1.amazonaws.com'
        ECR_REPO        = 'ticketnova'
        IMAGE_TAG       = "${BUILD_NUMBER}"
        APP_SERVER_IP   = '3.111.23.99'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh """
                    docker build -t ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG} .
                    docker tag ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPO}:latest
                """
            }
        }

        stage('Push to ECR') {
            steps {
                echo 'Pushing image to AWS ECR...'
                withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        docker push ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Deploy to App Server') {
            steps {
                echo 'Deploying to App Server...'
                withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                    sh """
                        ssh -i ~/ticketnova-key.pem -o StrictHostKeyChecking=no ubuntu@${APP_SERVER_IP} '
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            docker pull ${ECR_REGISTRY}/${ECR_REPO}:latest
                            docker stop ticketnova || true
                            docker rm ticketnova || true
                            docker run -d --name ticketnova -p 3000:3000 ${ECR_REGISTRY}/${ECR_REPO}:latest
                            echo "✅ App deployed successfully!"
                        '
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Running health check...'
                sh """
                    sleep 10
                    curl -f http://${APP_SERVER_IP}:3000/health || exit 1
                    echo "✅ Health check passed!"
                """
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
            echo "App is live at: http://${APP_SERVER_IP}:3000"
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
