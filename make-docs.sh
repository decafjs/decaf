#!/bin/sh

jsduck builtins modules --guides guides.json --warnings=-global --output docs --welcome=README.md

