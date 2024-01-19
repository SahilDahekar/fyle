# Fyle Web Development Internship
![image](https://github.com/SahilDahekar/fyle/assets/97726887/80d3429e-484d-4192-96e7-57e805990beb)

This project displays the Github repositories along with associated topics for a specific user. Currently the project displays my repositories. 

**Github Link** : [https://github.com/SahilDahekar/fyle](https://github.com/SahilDahekar/fyle)

**Project Deployed Link** : [https://fyle-sahildahekar.netlify.app/](https://fyle-sahildahekar.netlify.app/)

## Features 
1. Option to select the number of repositories to display per page `support upto 100 per page`. ( `10` , `50` , `100` ) .
2. Basic user info like `profile photo` , `name` , `bio` , `location` , `twitter username` , `github link` are displayed .
3. Implemented `loader` while data is being fetched .
4. Navigation can be done using specific `page number buttons` or `prev & next buttons` or `skip buttons` that are displayed if there are `10` or `more pages` .
5. For each repository the `name` , `description` , `languages` associated are displayed . If `languages` exceed `3` then the count of remaining languages is displayed .
6. Implemented `server-side pagination` using `Github REST API` based on per page option .
7. Current page is `highlighted` by `red color` page button.
8. Responsive website can be accessed on `mobile devices` as well . 

## Steps to Setup Locally 

 ### Step 1 :
 Fork the repo or alternatively download zip and extract it in any folder of choice .
 > **Note** : If downloaded zip skip step 2 .

 
### Step 2 :
 If forked the clone the repo using `git clone` command .
```
git clone https://github.com/<username>/fyle.git
```


### Step 3 :
Open this folder `/fyle` in IDE of your choice .


### Step 4 :
Create a new Github personal access token . Follow this article to create the token [link](https://docs.github.com/en/enterprise-server@3.8/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#about-personal-access-tokens) .

> This is needed because the number of api calls exceed 60 that is available for unauthenticated users.


### Step 5 :
Create a new `config.js` file in the same folder ( `/fyle` ) .


### Step 6 :
Copy the below code in this `config.js` file and replace `<YOUR_GITHUB_TOKEN>` with your personal access token obtained.
```
export const TOKEN = "<YOUR_GITHUB_TOKEN>";
```
> **Note** : Remember to replace `<YOUR_GITHUB_TOKEN>` with your actual token obtained from above steps .


### Step 7 :
Open the `index.html` file in the browser of your choice and your are done !!!

If your wish to see repositories for any `other user` you can `change` the name in `USER_URL` variable present at the top of `main.js` file.
> In this case replace "SahilDahekar" with any other valid github username
```
// https://api.github.com/users/<username>
const  USER_URL  =  'https://api.github.com/users/SahilDahekar';
```
