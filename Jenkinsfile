pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "promanage-backend"
        DOCKER_IMAGE_FRONTEND = "promanage-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // This is handled by Jenkins if using Git plugin
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build & Test') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
                echo 'Building backend...'
            }
        }

        stage('Dockerize & Deploy') {
            steps {
                echo 'Starting Multi-Container Environment...'
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            echo 'Pipeline Execution Finished.'
        }
        success {
            echo 'Deployment Successful! App is running on http://localhost:3000'
        }
    }
}
