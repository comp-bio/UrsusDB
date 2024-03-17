#!/bin/sh
python ./run.py server -editable Yes -port 9410 & 
P1=$!
sleep 1
python ./run.py server -port 9420 & 
P2=$!
wait $P1 $P2
