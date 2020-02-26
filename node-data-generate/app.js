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

  var entry = {
    cn: fn,
    sn: ln,
    email: [email],
    objectclass: 'put_something_here'
  };

  client.add('cn=foo, o=example', entry, function(err){ //async in a for, bad, fix later
    if(err){
      console.log(err);
    }
  });

}
