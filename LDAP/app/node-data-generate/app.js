/*
ldap - auto generate shit data
install/run
-mkdir node_modules
-npm i install
-node app
*/

var ldap = require('ldapjs');
var faker = require('faker');

var usercount = 1; //how many fake users to add

var client = ldap.createClient({
	url: 'ldap://user_openldap_1' //put the url here
});

client.bind('cn=admin,dc=linuxlab,dc=salisbury,dc=edu', 'password' ,function(err){
console.log(err);
});

var i;
for(i = 0; i < usercount; i++){

  var fn = faker.name.firstName(),
      ln = faker.name.lastName(),
      email = faker.internet.email();

  //console.log('adding entry: ' + fn + ' ' + ln + ' : ' + email);
  
  /*
  dn format: cn=faculty,ou=group,dc=linuxlab,dc=salisbury,dc=edu
  */

  var entry = {
    cn: 'Dummy Account3',
    //gidNumber: '100' ,
    //homeDirectory: '/home/dummyaccount',
    objectClass: 'top',
    objectClass: 'posixAccount',
    objectClass: 'inetOrgPerson',
    sn: 'dummyaccount3',
    uid: 'dummyaccount3'
    //uidNumber: '1'
  };
  
  var dn = 'uid=dummyaccount3,ou=people,dc=linuxlab,dc=salisbury,dc=edu'
  
  /*
  
  adding api - add(dn, entry, controls, callback)
  only thing to change here is dn
  
  */

  client.add(dn, entry, function(err){ //async in a for, bad, fix later
    if(err){
      console.log(err);
    }
  });

}
