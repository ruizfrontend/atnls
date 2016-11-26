#!/bin/bash
grunt compile
tail /pass
rsync -avz ./deploy/* eldiario@37.46.75.25:/home/eldiario/html/back/ochomarzo06
