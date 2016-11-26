#!/bin/bash
tail /pass 

rsync -avz ./img/* eldiario@37.46.75.25:/home/eldiario/html/lab/estaticos/ochomarzo06/
