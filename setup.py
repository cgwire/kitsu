#!/usr/bin/env python
from imp import load_source
from os import path
from setuptools import setup


zou = load_source('version', path.join('zou', '__init__.py'))

setup(version=zou.__version__)
