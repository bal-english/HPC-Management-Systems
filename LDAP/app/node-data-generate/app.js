/*
ldap - auto generate shit data

install/run
-mkdir node_modules
-npm i install
-node app
*/
//var web_url=process.env.RUNNABLE_CONTAINER_ID;
var ldap = require('ldapjs');
var faker = require('faker');
//console.log(web_url);
var usercount = 10; //how many fake users to add

var client = ldap.createClient({
	url: 'ldap://user_openldap_1' //put the url here
	//url: 'ldap://172.18.0.2' //put the url here
	//url: 'openldap' //put the url here
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
  
  /*
  
  adding api - add(dn, entry, controls, callback)
  only thing to change here is dn
  
  use: dn: uid=dummyaccount, ou=people....
  
  */
	
  var dn = 'cn=' + entry.cn + ', sn=' + entry.sn;

  client.add(dn, entry, function(err){ //async in a for, bad, fix later
    if(err){
      console.log('LDAP Insertion Err on dn: ' + dn);
      console.log(err);
    }
  });

}
