cd fe && python3 -m http.server 8000 &
cd be && python3 -m http.server 8080 &
cd blog && python3 -m http.server 9000 &
