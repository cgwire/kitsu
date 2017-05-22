#!/usr/bin/env python

import os
import re
import sys

from setuptools import setup, find_packages


def get_requirements_list(file_name):
    requires = open(file_name).read().split('\n')
    return [x for x in requires if len(x) > 0]


if sys.argv[-1] == 'publish':
    os.system('python setup.py sdist upload')
    sys.exit()

packages = [
    'zou',
]


requires = get_requirements_list('requirements.txt')
test_requirements = get_requirements_list('requirements_test.txt')

with open('zou/__init__.py', 'r') as fd:
    version = re.search(
        r'^__version__\s*=\s*[\'"]([^\'"]*)[\'"]',
        fd.read(),
        re.MULTILINE
    ).group(1)

if not version:
    raise RuntimeError('Cannot find version information')

with open('README.md', 'r') as f:
    readme = f.read()

setup(
    name='zou',
    version=version,
    description='Zou is an API to store and manage the data of your CG production.',
    long_description=readme,
    author='CG Wire',
    author_email='frank@cg-wire.com',
    url='https://cg-wire.com',
    packages=find_packages(),
    package_data={'': ['LICENSE']},
    package_dir={'zou': 'zou'},
    include_package_data=True,
    install_requires=requires,
    license='LGPL',
    zip_safe=False,
    classifiers=(
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'Natural Language :: English',
        'License :: OSI Approved :: GNU Library or Lesser General Public License (LGPL)'
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: Implementation :: CPython',
        'Programming Language :: Python :: Implementation :: PyPy'
    ),
    test_suite='test',
    tests_require=test_requirements,
    extras_require={
    },
)
