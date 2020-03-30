/*
ldap - auto generate shit data
install/run
-mkdir node_modules
-npm i install
-node app
*/

var ldap = require('ldapjs');
var faker = require('faker');

var usercount = 10; //how many fake users to add

var client = ldap.createClient({
  url: 'ldap://127.0.0.1:1389' //put the url here
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
    cn: 'Dummy Account',
    gidNumber: 100,
    homeDirectory: '/home/dummyaccount',
    objectClass: 'top',
    objectClass: 'posixAccount',
    objectClass: 'inetOrgPerson',
    sn: 'dummyaccount',
    uid: 'dummyaccount',
    uidNumber: 999999
  };
  
  var dn = 'uid=dummyaccount,ou=people,dc=linuxlab,dc=salisbury,dc=edu'
  
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
