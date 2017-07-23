from setuptools import setup

setup(
    name='FlaskApp',
    packages=['FlaskApp'],
    include_package_data=True,
    install_requires=[
        'flask',
        'pandas',
        'json',
        'flask_cors',
        'pickle',
        'sqlalchemy'
    ],
)