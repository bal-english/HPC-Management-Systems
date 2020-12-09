$('#createuser').click(function(){

    $.ajax({
      url: '/api/user/create',
      type: 'POST',
      datatype: 'json',
      data: {
        email: $('#create_email').val(),
        cn: $('#create_cn').val()
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
        password: $('#modify_password').val(),

      },
      success: function(data){
        if(data.error)
        {
          displayError(data.error, 'test2');
        }
        else
        {
            displaySuccess('Successfully changed user password!', "test2");
            console.log(data)
        }
      }
    });

  });
  $('#modifyOwn').click(function(){

    $.ajax({
      url: '/api/user/modifyOwn',
      type: 'POST',
      datatype: 'json',
      data: {
        password: $('#modify_own_password').val(),
      },
      success: function(data){
        if(data.error)
        {
          displayError(data.error, 'test3');
        }
        else
        {
            displaySuccess('Successfully changed password!', "test3");
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
        if(data.error)
        {
          displayError(data.error, 'test4');
        }
        else
        {
          displaySuccess('Successfully deleted user!', "test4");
          console.log(data)
        }
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
      }
    });

  });
  
  function displayError(msg, div){
    var errorbox = `<div class="alert alert-danger alert-dismissible">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>` + msg + `</div>`
    $("#" + div).html(errorbox);
  } 
  function displaySuccess(msg, div){
    var successbox = `<div class="alert alert-success alert-dismissible">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>` + msg + `</div>`
    $("#" + div).html(successbox);
  } 