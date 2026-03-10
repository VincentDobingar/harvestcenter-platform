#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=4096"
exec /home2/sc2djem5820/nodevenv/api/harvestcenter-api/22/bin/node server.js
