$('#createuser').click(function(){

    $.ajax({
      url: '/api/user/create',
      type: 'POST',
      datatype: 'json',
      data: {
        email: $('#create_email').val(),
        cn: $('#create_cn').val(),
        pw: $('#create_pw').val()
      },
      success: function(data){
        if(data.error)
        {
          displayError(data.error, 'test');
        }
        else
        {
          var usr = 
          "cn: " + data.success.cn.value +
          "<br/>" +
          "dn: " + 
          data.success.dn.bag.map((res)=>{return res.key+"="+res.value}).join(',') +
          "<br/>" +
          "gidNumber: " + data.success.gidNumber.value +
          "<br/>" +
          "hd: " + data.success.homeDirectory.value +
          "<br/>" +
          "uid: " + data.success.uid.value +
          "<br/>" +
          "uidNumber: " + data.success.uidNumber.value +
          "<br/>" +
          "sn: " + data.success.sn.value
          displaySuccess('User added <br/> ' + usr, "test");
          console.log(data)
        }
      }
    });

  });

  $('#modifyuser').click(function(){

    $.ajax({
      url: '/api/user/modify',
      type: 'POST',
      datatype: 'json',
      data: {
        dn: $('#modify_dn').val(),
        cn: $('#modify_cn').val(),
        userPassword: $('#modify_password').val(),
        gidNumber: $('#modify_gidnumb').val(),
        homeDirectory: $('#modify_homedir').val(),
      },
      success: function(data){
        if(data.error)
        {
          displayError(data.error, 'test2');
        }
        else
        {
          var usr = 
            "cn: " + data.success.cn.value +
            "<br/>" +
            "dn: " + 
            data.success.dn.bag.map((res)=>{return res.key+"="+res.value}).join(',') +
            "<br/>" +
            "gidNumber: " + data.success.gidNumber.value +
            "<br/>" +
            "hd: " + data.success.homeDirectory.value +
            "<br/>" +
            "uid: " + data.success.uid.value +
            "<br/>" +
            "uidNumber: " + data.success.uidNumber.value +
            "<br/>" +
            "sn: " + data.success.sn.value +
            "<br/>" +
            "userPassword: " + data.success.userPassword.value;
            displaySuccess('User modified <br/> ' + usr, "test2");
            console.log(data)
        }
      }
    });

  });

  $('#deleteuser').click(function(){

    $.ajax({
      url: '/api/user/delete',
      type: 'POST',
      datatype: 'json',
      data: {
        email: $('#delete_email').val()
      },
      success: function(data){
        alert(data);
      }
    });
  });

    $('#logoutuser').click(function(){
    document.cookie = "token=" + 0;
    $.ajax({
      url: '/api/user/logout',
      type: 'POST',
      datatype: 'json',
      success: function(data){
        window.location.href="/";
        alert(data);
      }
    });

  });
  
  function displayError(msg, div){
    var errorbox = `<div class="alert alert-danger alert-dismissible">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>` + msg + `</div>`
    $("#" + div).append(errorbox);
  } 
  function displaySuccess(msg, div){
    var successbox = `<div class="alert alert-success alert-dismissible">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>` + msg + `</div>`
    $("#" + div).append(successbox);
  } 