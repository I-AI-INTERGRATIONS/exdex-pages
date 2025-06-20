from setuptools import setup, find_packages

setup(
    name="exdex",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "web3==6.10.0",
        "python-dotenv==1.0.0",
        "eth-account==0.9.0",
        "eth-utils==2.3.0",
        "flask==3.0.0"
    ],
    entry_points={
        "console_scripts": [
            "exdex=frontend.airdrop:main"
        ]
    }
)
