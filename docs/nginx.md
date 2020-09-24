# Nginx and routing for eol-stats

## Docker considerations

The containers should be added to the sandbox docker-compose.yml but we can also attach our containers to the sandbox network. This is by default **sandbox_default** but it can be changed on both docker-compose configurations.

Note: remember to restart the sandbox nginx once the compose is up.

## Routing on nginx

Using a subdomain we add the configuration on the sandbox nginx container. The file nginx.example.conf provides an example. The routing for lms should contain a subdomain with HTTPS certificates. In particular the routes */api/* are reserved for the backend as */static/* for assets. The rest goes to the frontend application.

## Webpack size info 

Since the frontend development image is 15MB the traffic might be slow. In that case you can add your domain on your /etc/hosts file so that the name resolution points to your machine and you don't have to traverse the internet.

The built image is around 1MB in size, so Round Trip Time is not a concern (unless your network is really bad).