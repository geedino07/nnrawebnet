# Steps to run this project locally

### Clone the repository

``` 
git clone https://github.com/geedino07/nnrawebnet.git
```

### Create a virtual environment 
```
python -m venv venv 
```

### Activate the virtual environment
Activate the virtual environment using `source .\venv\Scripts\activate` on windows and `source venv/bin/activate`  for mac and Linux

After this, _venv_ should now be prepended to the file path on the terminal, this indicates the virtual environment is successfully activated

To confirm this type `which python` on your terminal. 
The python path will show the current directory where virtual environment was just installed

### Install requirements
For this step, ensure the virtual environment is activated and you are in the folder containing the requirements.txt file
```
pip install -r requirements.txt
```

### Set debug value
To run this project locally, we need DEBUG variable in the settings.py file to be set to true, this tells django we are in a development environment

Go into the settings.py file and set the value of the variable DEBUG to True
```
DEBUG = True 
```

### Make migrations 
From your teminal, navigate into the folder containing the manage.py files 

```
   cd nnra_circle
```

Run the following commands

``` 
 python manage.py makemigrations
```

```
python manage.py migrate
```

### Run the server 

``` 
python manage.py runserver
```

The above command will run python on the default port which is 8000, if you would like to specify a custom port run 
```
python manage.py runserver <port>
```

### Access the api

Your server should now be running on `https://localhost:8000`