# <p align=center> Management Systems for the High Performance Computing Lab at Salisbury University <br> <sub>Team TH2 - Salisbury University Software Engineering </p>

## Project Overview
Universal Systems:
 * Docker

## Content Management System
### Docker Images
- <b>Postgres</b>		(Database)
- <b>Ubuntu</b>			(Database Initialization)
- <b>Adminer</b>		(Database Admin)
- <b>Pgadmin4</b>		(Database Admin)
- <b>Node</b>			(Web Server)

### Database Features
* Objects
	* Users
	* Usergroups
	* Permissions
		* Assignable to Users and Usergroups
* Content-Based Objects
	* Blogs
	* Bloggroups
		* Category classification
* Support-Based Objects
	* Tickets

### Web Server Features
#### Node Packages
* Base:
	* body-parser
	* express
	* pg
	* ejs
	* node-fetch
	* paseto
* Other
	* cookie-parser
	* crypto

#### Components
* REST API - For querying the database or statistics about it.
* EJS Templating - For populating and sending website content.
* PASETO Authorization - For user authorization systems.

### TODO List (11/11): 
- [ ] (grace) editing of a ticket (admin side, **on individual ticket pages**)
	- basically like making a ticket
- [ ] (grace) editing of a user (admin side , **on individual user pages**)
- [ ] (grace) editing of a blog (admin side, **on individual blog pages**)
