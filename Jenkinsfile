pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
            }
        }

        stage('Dockerize & Deploy') {
            steps {
                echo 'Building and starting containers using Docker Compose...'
                // Using --build ensures Docker handles npm install internally
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying deployment...'
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ ProManage is LIVE at http://localhost:3000'
        }
        failure {
            echo '❌ Deployment Failed. Check Docker logs.'
        }
    }
}
