#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-notes-manager-220959-220995/notes_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

