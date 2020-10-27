
# COSC 425 Software Engineering
A study of classical and object‑oriented software engineering principles and methods.  Topics include software processes, requirements analysis, design, testing and maintenance, project management and software metrics, process improvement. Agile software development and open-source software development are also covered.

## Project: HPCL User Management System & Website Development

### HPCL Website and User Management System

Goals for Fall 2020

Postgres Database
- [ ] Complete REST API
  - information here
- [ ] User roles
  
Web routing
- [ ] Move static to dynamic routing 
- [ ] Embellish on original webpages
- [ ] Admin pages

Ticketing system
- [ ] fully automated/dynamic creation
---

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

## User Management System
<em> Coming Soon </em>
