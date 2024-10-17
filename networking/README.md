# Main file: nginx.conf

# Steps to verify:

- install `python3` and `nginx`
- start 3 services: from current folder, run `sh run.sh`
- create an nginx configuration file: `sudo nano /etc/nginx/sites-available/gw-routing`
- add the content of `nginx.conf` (from the current folder) to `/etc/nginx/sites-available/gw-routing`
- create a symbolic link: `sudo ln -s /etc/nginx/sites-available/gw-routing /etc/nginx/sites-enabled/`
- test nginx configuration: `sudo nginx -t`
- reload or restart nginx: `sudo systemctl reload nginx` or `sudo systemctl restart nginx`
- add the following entry to `/etc/hosts`: `127.0.0.1 gw-routing`
- go to `http://gw-routing`, `http://gw-routing/api`, `http://gw-routing/blog`, `http://gw-routing/content` to check
