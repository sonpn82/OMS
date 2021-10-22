# OMS-github
A simple order management program using Nodejs
The development strictly follow "The web development bootcamp" from Colt Steele in Udemy.

The program was built using Nodejs & mongodb for database part.
The structure of the program is as below:
  - models folder: contain models for customer, order, product & user
  - views folder: contain view in .ejs form for customers, products, orders, users & report
  - controller folder: contain controller for customers, orders, products, users & report
  - routes folder: contain routes to each view & controller
  - utils: some essential functions
  - public: javascript & CSS files served to client
  - cloudinary: online storage for storing & retrieving images
  - middleware.js: middleware file, contain middlewares for login, validation ...
  - schemas.js: using Joi for request validation 
  - app.js: main application file
  - .gitignore: file which contain list of files that excluded from uploading to github or other git remote locs.
  - .env: not uploaded to github, contain sensitive information.

This program allow users to:
- create & edit products.
- create & edit customers.
- create & edit orders from input product & customer info.
- calculate total income & profit from each order
- give summary report on remained quantity of each product
- give summary report on profit & sale on monthly detail.

Owner of the program can create admin account or guest account.
Admin account can create & edit product, customer, orders but can not create new account.
Guest account can only view all items but not edit.
