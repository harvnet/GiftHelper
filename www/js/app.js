
var app= {
    db:null,
	version:'1.0',
	loadRequirements:0,
	modal:null,
	globalPersonId:0,
	globalOccId:0,
	purchasedItem:"",
	p: document.createElement("p"),
	p2: document.createElement("p"),

	initialize: function() {
        
		document.addEventListener("DOMContentLoaded", app.onDomReady());
		document.addEventListener("deviceready",app.onDeviceReady(),false);
    },
	
	onDeviceReady: function(){
		app.loadRequirements++;
		if(app.loadRequirements === 2){
			app.start();
		}
	},
	onDomReady: function(){
		app.loadRequirements++;
		if(app.loadRequirements === 2){
			app.start();
		}
	},
	start: function(){
		app.createdb();
		app.fillPeople();
	},
	createdb: function(){
		app.db = window.openDatabase('giftr','','Giftr',1024*1024);
		
		if(app.version == ''){
			alert('First time running... create tables'); 
			//means first time creation of DB
			//increment the version and create the tables
			app.db.changeVersion('', app.version,
					function(trans){
						//something to do in addition to incrementing the value
						//otherwise your new version will be an empty DB
						alert("DB version incremented");
						//do the initial setup
								//create some table(s)
								//add stuff into table(s)
						trans.executeSql('CREATE TABLE people(person_id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT)', [], 
										function(tx, rs){
											//do something if it works
											alert("Table people created");
										},
										function(tx, err){
											//failed to run query
											alert( err.message);
										});
										
						trans.executeSql('INSERT INTO people(person_name) VALUES(?)', ["Paul"], 
										function(tx, rs){
											//do something if it works, as desired   
											alert("Added row in people");
										},
										function(tx, err){
											//failed to run query
											alert( err.message);
										});
						trans.executeSql('CREATE TABLE occasions(occ_id INTEGER PRIMARY KEY AUTOINCREMENT, occ_name TEXT)', [], 
										function(tx, rs){
											//do something if it works
											alert("Table occ created");
										},
										function(tx, err){
											//failed to run query
											alert( err.message);
										});
										
						trans.executeSql('INSERT INTO occasions(occ_name) VALUES(?)', ["Christmas"], 
										function(tx, rs){
											//do something if it works, as desired   
											alert("Added row in occ");
										},
										function(tx, err){
											//failed to run query
											alert( err.message);
										});
						
						trans.executeSql('CREATE TABLE gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, occ_id INTEGER, gift_idea TEXT, purchased TEXT)', [], 
										function(tx, rs){
											//do something if it works
											alert("Table gift created");
										},
										function(tx, err){
											//failed to run query
											alert( err.message);
										});
					},
					function(err){

					},
					function(){
						//successfully completed the transaction of incrementing the version number   
								app.version = '1.0';
								//alert("Change version function worked.");
					});
		}else{
			//version should be 1.0
			//this won't be the first time running the app
			//alert("DB has previously been created");
			//alert('Version:' + app.version);
		}
	},
	
	fillPeople: function(){
        
		document.getElementById("people-list").style.display="block";
        document.getElementById("occasion-list").style.display="none";
        document.getElementById("gifts-for-person").style.display="none";
        document.getElementById("gifts-for-occasion").style.display="none";
		document.getElementById("plainfooter").style.display="block";
		document.getElementById("backfooter").style.display="none";
		
        var peoplePage = document.getElementById("people-list");
		var div = document.getElementById("peoplelist");
		div.innerHTML = '';
		peoplePage.appendChild(div);
		var nameul = document.createElement("ul");
		nameul.setAttribute("data-role","listview");
		div.appendChild(nameul);
		var norecords=false;

        app.db.transaction(function(trans){
        trans.executeSql("SELECT * FROM people", [],
                function(tx, rs){
                         var len = rs.rows.length;

                         for (var i=0; i<len; i++) {
                         // display one person_name
							 var li = document.createElement("li");
							 li.dataset.ref = rs.rows.item(i).person_id;
							 li.innerHTML = rs.rows.item(i).person_name;
							 nameul.appendChild(li);
                         }
                },
                function(tx, err){
                    console.log("Error: " + err);
					norecords = true;
                });
        });
		if (norecords) {
			alert ("no records");
		} else {
		div.appendChild(nameul);	
		}
		
			var hammertime2 = new Hammer.Manager(peoplePage);	
			var swipeRight2 = new Hammer.Swipe({event: 'swiperight', direction: Hammer.DIRECTION_RIGHT});
			
			hammertime2.add([swipeRight2]);

			hammertime2.on('swiperight', function(ev) {
				ev.preventDefault();
				console.log(ev);
				nameul.innerHTML = '';
				div.appendChild(nameul);				
				app.fillOccasions(ev);
			});
			var mchammertime5 = new Hammer.Manager(nameul);
			
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});
			mchammertime5.add([doubleTap, singleTap]);
			doubleTap.requireFailure('singletap');
				
			mchammertime5.on('singletap', function(ev) {
				console.log(ev);
				app.giftsforperson(ev);
			});
			mchammertime5.on('doubletap', function(ev) {
				console.log(ev);
				app.deleteperson(ev);
			});
			
			var addbutton = document.getElementById("btnAdd1");
			var mc = new Hammer.Manager(addbutton);
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mc.add([singleTap]);	
			mc.on('singletap', function(ev) {
				document.querySelector("[data-role=overlay]").style.display="block";
				document.getElementById("add-person").style.display="block";
				app.newperson();
			});
	},
	fillOccasions: function(){
		
		document.getElementById("people-list").style.display="none";
        document.getElementById("occasion-list").style.display="block";
        document.getElementById("gifts-for-person").style.display="none";
        document.getElementById("gifts-for-occasion").style.display="none";
		document.getElementById("plainfooter").style.display="block";
		document.getElementById("backfooter").style.display="none";
        
		var occPage = document.getElementById("occasion-list");
		var div2 = document.getElementById("occasionlist");
		div2.innerHTML = '';
		occPage.appendChild(div2);
		var nameul2 = document.createElement("ul");
		nameul2.setAttribute("data-role","listview");
		
		div2.appendChild(nameul2);
		var norecords=false;
        
        app.db.transaction(function(trans){
        trans.executeSql("SELECT * FROM occasions", [],
                function(tx, rs){
                         var len = rs.rows.length;

                         for (var i=0; i<len; i++) {
                         // display one person_name
							 var li = document.createElement("li");
							 li.dataset.ref = rs.rows.item(i).occ_id;
							 li.innerHTML = rs.rows.item(i).occ_name;
							 nameul2.appendChild(li);
                         }
                },
                function(tx, err){
                    console.log("Error: " + err);
					norecords = true;
                });
       });
		if (norecords) {
			alert ("no records");
		} else {
			div2.appendChild(nameul2);	
		}
		    var hammertime1 = new Hammer.Manager(occPage);	
			var swipeLeft1 = new Hammer.Swipe({event: 'swipeleft', direction: Hammer.DIRECTION_LEFT});
			
			hammertime1.add([swipeLeft1]);
			
			hammertime1.on('swipeleft', function(ev) {
				ev.preventDefault();
				console.log(ev);
				nameul2.innerHTML = '';
				div2.appendChild(nameul2);
				app.fillPeople(ev);
			});
			
			var mchammertime4 = new Hammer.Manager(nameul2);
			
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});
			mchammertime4.add([doubleTap, singleTap]);
			doubleTap.requireFailure('singletap');
				
			mchammertime4.on('singletap', function(ev) {
				console.log(ev);
				app.giftsforoccasion(ev);
			});
			mchammertime4.on('doubletap', function(ev) {
				console.log(ev);
				app.deleteoccasion(ev);
			});
			
			var addbutton = document.getElementById("btnAdd2");
			var mc = new Hammer.Manager(addbutton);
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mc.add([singleTap]);	
			mc.on('singletap', function(ev) {
				document.getElementById("add-occasion").style.display="block";
				document.querySelector("[data-role=overlay]").style.display="block";
				app.newOccasion();
			});
	},
	newperson: function(ev) {

		document.getElementById("CancelP").addEventListener("click",function(ev) {
		ev.preventDefault();
		document.getElementById("add-person").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";

		});
		
		document.getElementById("SaveP").addEventListener("click",function(ev) {
			
			app.db.transaction(function(trans){

				var name = document.getElementById("new-per").value
				
				alert(name);
								
				trans.executeSql('INSERT INTO people(person_id, person_name) VALUES(null, ?)', [name], 
					function(tx, rs){
						document.getElementById("add-person").style.display="none";
						document.querySelector("[data-role=overlay]").style.display="none";
						app.fillPeople();
					},
					function(tx, err){
						alert( err.message);
					});
		
			});
			
		});
	},
	giftsforperson: function(ev) {
		document.getElementById("people-list").style.display="none";
        document.getElementById("occasion-list").style.display="none";
        document.getElementById("gifts-for-person").style.display="block";
        document.getElementById("gifts-for-occasion").style.display="none";
		document.getElementById("plainfooter").style.display="none";
		document.getElementById("backfooter").style.display="block";
        
		var gfpPage = document.getElementById("gifts-for-person");
		var div3 = document.getElementById("giftpeoplelist");
		div3.innerHTML = '';
		gfpPage.appendChild(div3);
		var nameul3 = document.createElement("ul");
		nameul3.setAttribute("data-role","listview");
		div3.appendChild(nameul3);
		var norecords=false;
		
			if (app.globalPersonId==0) {
				var item = ev.target.getAttribute("data-ref");
				app.globalPersonId = item;
			} else {
				var item = app.globalPersonId;
			}
			
		var divmess2 = document.getElementById("modelmessage2");
		
		app.p2.className = "messdetails2";
		console.log("made it here - gift ideas");	
		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM people WHERE person_id = ? ", [item],
				function(tx, rs){
						app.p2.innerHTML = "Here are all the gift ideas for <em>" + rs.rows.item(0).person_name + "</em> for all occasions.";
						divmess2.appendChild(app.p2);
				},
				function(tx, err){
                    console.log("Error: " + err);
                });
       	});
		console.log("made it here again - gift ideas");	 
        app.db.transaction(function(trans){
        trans.executeSql("SELECT g.purchased, g.gift_id, g.gift_idea, o.occ_name FROM gifts AS g INNER JOIN occasions AS o ON o.occ_id = g.occ_id WHERE g.person_id = ? ORDER BY o.occ_name, g.gift_idea", [item],
                function(tx, rs){
                         var len = rs.rows.length;

                         for (var i=0; i<len; i++) {
                         // display one person_name
							 var li = document.createElement("li");
							 
							 if (rs.rows.item(i).purchased=="yes") {
							 	li.className = "purchased";
							 } else {
								 li.className = "";
							 }
							 
							 li.dataset.ref = rs.rows.item(i).gift_id;
							 li.innerHTML = rs.rows.item(i).gift_idea + " - " + rs.rows.item(i).occ_name;
							 nameul3.appendChild(li);
                         }
                },
                function(tx, err){
                    console.log("Error: " + err);
					norecords = true;
                });
				
       });
		if (norecords) {
			alert ("no records");
		} else {
			div3.appendChild(nameul3);	
		}

			var mchammertime = new Hammer.Manager(nameul3);
			
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});
			mchammertime.add([doubleTap, singleTap]);
			doubleTap.requireFailure('singletap');
				
			mchammertime.on('singletap', function(ev) {
				//ev.preventDefault();
				console.log("SINGLE TAPPED EVENT HERE!");
				app.purchasegiftperson(ev);
				// turn colour on.
			});
			mchammertime.on('doubletap', function(ev) {
				app.deletepersongift(ev);
				// delete entry
			});
			
			var addbutton = document.getElementById("btnAdd3");
			var mc = new Hammer.Manager(addbutton);
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mc.add([singleTap]);	
			mc.on('singletap', function(ev) {
				document.getElementById("add-gift-person").style.display="block";
				document.querySelector("[data-role=overlay]").style.display="block";
				app.newGiftForPerson();
			});
			
			var backbutton2 = document.getElementById('btnBack');		
			
			var mcback2 = new Hammer.Manager(backbutton2);	
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mcback2.add([singleTap]);
	
			 mcback2.on("singletap", function(ev) {
			//ev.preventDefault();
			document.getElementById("people-list").style.display="block";
			document.getElementById("gifts-for-person").style.display="none";
			document.getElementById("plainfooter").style.display="block";
			document.getElementById("backfooter").style.display="none";			
			
		 	});			
	},
	deleteperson: function(ev) {
		var item = ev.target.getAttribute("data-ref");
		
		document.getElementById("delete-confirmation").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";

		document.getElementById("CancelDel").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("delete-confirmation").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
		
		});
		
		document.getElementById("Delete").addEventListener("click",function(ev) {
			
		
			app.db.transaction(function(trans){
			trans.executeSql('DELETE FROM people WHERE person_id = ?', [item], 
				function(tx, rs){
					//do something if it works, as desired   
					document.getElementById("delete-confirmation").style.display="none";
					document.querySelector("[data-role=overlay]").style.display="none";
					app.fillPeople();
					
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}); 	
			app.fillPeople();
		});
	},
	newOccasion: function() {

		document.getElementById("CancelO").addEventListener("click",function(ev) {
		ev.preventDefault();
		document.getElementById("add-occasion").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";
		
		});
		
		document.getElementById("SaveO").addEventListener("click",function(ev) {
			
			app.db.transaction(function(trans){
			
				var name = document.getElementById("new-occ").value
								
				trans.executeSql('INSERT INTO occasions(occ_id, occ_name) VALUES(null, ?)', [name], 
					function(tx, rs){
						document.getElementById("add-occasion").style.display="none";
						document.querySelector("[data-role=overlay]").style.display="none";
						
						app.fillOccasions();
					},
					function(tx, err){
						//failed to run query
						alert( err.message);
					});
			});
		});
		
			
	},
	giftsforoccasion: function(ev) {

		document.getElementById("people-list").style.display="none";
        document.getElementById("occasion-list").style.display="none";
        document.getElementById("gifts-for-person").style.display="none";
        document.getElementById("gifts-for-occasion").style.display="block";
		document.getElementById("plainfooter").style.display="none";
		document.getElementById("backfooter").style.display="block";
        
		var gfoPage = document.getElementById("gifts-for-occasion");
		var div4 = document.getElementById("giftocclist");
		div4.innerHTML = '';
		gfoPage.appendChild(div4);
		var nameul4 = document.createElement("ul");
		nameul4.setAttribute("data-role","listview");
		div4.appendChild(nameul4);
		var norecords=false;

		var divmess = document.getElementById("modelmessage1");
		
		app.p.className = "messdetails1";

			if (app.globalOccId==0) {
				var item = ev.target.getAttribute("data-ref");
				app.globalOccId = item;
			} else {
				var item = app.globalOccId;
			} 

		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM occasions WHERE occ_id = ? ", [item],
				function(tx, rs){
					if (rs.rows.item(0).occ_name == "") {
					} else {
						app.p.innerHTML = "Here are all the gift ideas for <em>" + rs.rows.item(0).occ_name + "</em> for all occasions.";
						divmess.appendChild(app.p);
					}
				},
				function(tx, err){
                    console.log("Error: " + err);
					norecords = true;
                });
       	});

        app.db.transaction(function(trans){
			
        trans.executeSql("SELECT g.purchased, g.gift_id, g.gift_idea, p.person_name FROM gifts AS g INNER JOIN people AS p ON p.person_id = g.person_id WHERE g.occ_id = ? ORDER BY p.person_name, g.gift_idea", [item],
                function(tx, rs){
                         var len = rs.rows.length;

                         for (var i=0; i<len; i++) {
                         // display one person_name
							 var li = document.createElement("li");
							 
							 if (rs.rows.item(i).purchased=="yes") {
							 	li.className = "purchased";
							 } else {
								 li.className = "";
							 }
							 							 
							 li.dataset.ref = rs.rows.item(i).gift_id;
							 li.innerHTML = rs.rows.item(i).gift_idea + " - " + rs.rows.item(i).person_name;
							 nameul4.appendChild(li);
                         }
                },
                function(tx, err){
                    console.log("Error: " + err);
					norecords = true;
                });
				
       });
		if (norecords) {
			alert ("no records");
		} else {
			div4.appendChild(nameul4);	
		}
		
		

			var mchammertime2 = new Hammer.Manager(nameul4);
			
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});
			mchammertime2.add([doubleTap, singleTap]);
			doubleTap.requireFailure('singletap');
				
			mchammertime2.on('singletap', function(ev) {
				//ev.preventDefault();
				console.log("SINGLE TAPPED EVENT HERE!");
				app.purchasegiftoccasion(ev);
				// turn colour on.
			});
			mchammertime2.on('doubletap', function(ev) {
				ev.preventDefault();
				console.log(ev);
				app.deleteoccgift(ev);
				// delete entry
			});
			
			var addbutton = document.getElementById("btnAdd4");
			var mc2 = new Hammer.Manager(addbutton);
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mc2.add([singleTap]);	
			mc2.on('singletap', function(ev) {
				document.getElementById("add-gift-occ").style.display="block";
				document.querySelector("[data-role=overlay]").style.display="block";
				app.newGiftForOccasion();
			});
			
			var backbutton = document.getElementById('btnBack');		
			
			var mcback = new Hammer.Manager(backbutton);	
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			mcback.add([singleTap]);
	
			 mcback.on("singletap", function(ev) {
			//ev.preventDefault();
			document.getElementById("occasion-list").style.display="block";
			document.getElementById("gifts-for-occasion").style.display="none";
			document.getElementById("plainfooter").style.display="block";
			document.getElementById("backfooter").style.display="none";
			
		 	});
	},
	
	deleteoccasion: function(ev) {
		var item = ev.target.getAttribute("data-ref");
		
		document.getElementById("delete-confirmation").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";

		document.getElementById("CancelDel").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("delete-confirmation").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
		
		});
		
		document.getElementById("Delete").addEventListener("click",function(ev) {
			
		
			app.db.transaction(function(trans){
				trans.executeSql('DELETE FROM occasions WHERE occ_id = ?', [item], 
				function(tx, rs){
					//do something if it works, as desired   
					document.getElementById("delete-confirmation").style.display="none";
					document.querySelector("[data-role=overlay]").style.display="none";
					app.fillOccasions();
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}); 
		
			app.fillOccasions();
		});
		
	},
	newGiftForPerson: function(ev) {
	
		var selector = document.getElementById("list-per-occ");
		
		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM occasions", [], 
			function(tx, rs){
				 var len = rs.rows.length;
				 
				 for (var i=0; i<len; i++) {
				 // display one person_name
					 var option = document.createElement("option");
					 option.value = rs.rows.item(i).occ_id;
					 option.textContent = rs.rows.item(i).occ_name;
					 option.className = "occasionName";
					 selector.appendChild(option);
				 }
			},
			function(tx, err){
			console.log("Error: " + err);
			norecords = true;
			});
		});					
		
		document.getElementById("CancelGP").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("add-gift-person").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
			app.giftsforperson();
		});
		
		document.getElementById("SaveGP").addEventListener("click",function(ev) {
			
			app.db.transaction(function(trans){
				
				var theselect = document.getElementById("list-per-occ");
				var occasionId = theselect.options[theselect.selectedIndex].value;
				var giftIdea = document.getElementById("new-idea-person").value;
							
				trans.executeSql('INSERT INTO gifts(gift_id, person_id, occ_id, gift_idea, purchased) VALUES(?, ?, ?, ?, ?)', [null, app.globalPersonId, occasionId, giftIdea, "no"], 
					function(tx, rs){
						document.getElementById("add-gift-person").style.display="none";
						document.querySelector("[data-role=overlay]").style.display="none";
						app.giftsforperson();
					},
					function(tx, err){
						//failed to run query
						alert( err.message);
					});
				
			});
			
		});
	},
	newGiftForOccasion: function(ev) {
		var selector = document.getElementById("list-people");
		
		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM people", [], 
			function(tx, rs){
				 var len = rs.rows.length;
				 
				 for (var i=0; i<len; i++) {
				 // display one person_name
					 var option = document.createElement("option");

					 option.value = rs.rows.item(i).person_id;
					 option.textContent = rs.rows.item(i).person_name;
					 option.className = "personName";
					 selector.appendChild(option);
				 }
			},
			function(tx, err){
			console.log("Error: " + err);
			norecords = true;
			});
		});					
		
		document.getElementById("CancelGO").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("add-gift-occ").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
			app.giftsforoccasion();
		});
		
		document.getElementById("SaveGO").addEventListener("click",function(ev) {
			
			app.db.transaction(function(trans){
				
				var theselect2 = document.getElementById("list-people");
				var personId = theselect2.options[theselect2.selectedIndex].value;
				var giftIdea = document.getElementById("new-idea-gift").value;
				
				//console.log("occId = " + globalOccId + " giftIdea = " + giftIdea + " PersonID = " + personId);
				trans.executeSql('INSERT INTO gifts(gift_id, person_id, occ_id, gift_idea, purchased) VALUES(?, ?, ?, ?, ?)', [null, personId, globalOccId, giftIdea, "no"], 
					function(tx, rs){
						document.getElementById("add-gift-occ").style.display="none";
						document.querySelector("[data-role=overlay]").style.display="none";
						app.giftsforoccasion();
					},
					function(tx, err){
						//failed to run query
						alert( err.message);
					});
				
			});
			
		});
	},
	deletepersongift: function(ev) {
		var item = ev.target.getAttribute("data-ref");

		document.getElementById("delete-confirmation").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";

		document.getElementById("CancelDel").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("delete-confirmation").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
		
		});
		
		document.getElementById("Delete").addEventListener("click",function(ev) {
		

	
			app.db.transaction(function(trans){
			trans.executeSql('DELETE FROM gifts WHERE gift_id = ?', [item], 
				function(tx, rs){
					alert("made it here!");
					document.getElementById("delete-confirmation").style.display="none";
					document.querySelector("[data-role=overlay]").style.display="none";
					app.giftsforperson();
					
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}); 
		
			app.giftsforperson();
		});
	},
	
	deleteoccgift: function(ev) {
		var item = ev.target.getAttribute("data-ref");
		
		document.getElementById("delete-confirmation").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";

		document.getElementById("CancelDel").addEventListener("click",function(ev) {
			ev.preventDefault();
			document.getElementById("delete-confirmation").style.display="none";
			document.querySelector("[data-role=overlay]").style.display="none";
		
		});
		
		document.getElementById("Delete").addEventListener("click",function(ev) {

			
		
			app.db.transaction(function(trans){
			trans.executeSql('DELETE FROM gifts WHERE gift_id = ?', [item], 
				function(tx, rs){
					document.getElementById("delete-confirmation").style.display="none";
					document.querySelector("[data-role=overlay]").style.display="none";
					app.giftsforoccasion();			
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}); 
		
			app.giftsforoccasion();
		});
	},
	
	purchasegiftperson: function(ev) {
		var item = ev.target.getAttribute("data-ref");
		

		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM gifts WHERE gift_id = ?", [item], 
			function(tx, rs){
				 app.purchasedItem = rs.rows.item(0).purchased;
				 
			},
			function(tx, err){
			console.log("Error: " + err);
			norecords = true;
			});
		});	

		app.db.transaction(function(trans){
		
			if (app.purchasedItem == "no") {
				trans.executeSql('UPDATE gifts SET purchased = "yes" WHERE gift_id = ?', [item], 
				function(tx, rs){
					app.giftsforperson();			
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			} else {
				trans.executeSql('UPDATE gifts SET purchased = "no" WHERE gift_id = ?', [item], 
				function(tx, rs){
					app.giftsforperson();			
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}
        }); 
	
		app.giftsforperson();
	},
	
	purchasegiftoccasion: function(ev) {
		var item = ev.target.getAttribute("data-ref");
		

		app.db.transaction(function(trans){
			trans.executeSql("SELECT * FROM gifts WHERE gift_id = ?", [item], 
			function(tx, rs){
				 app.purchasedItem = rs.rows.item(0).purchased;
				 
			},
			function(tx, err){
			console.log("Error: " + err);
			norecords = true;
			});
		});	

		app.db.transaction(function(trans){
		
			//alert(app.purchasedItem);
		
			if (app.purchasedItem == "no") {
				trans.executeSql('UPDATE gifts SET purchased = "yes" WHERE gift_id = ?', [item], 
				function(tx, rs){
					app.giftsforoccasion();			
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			} else {
				trans.executeSql('UPDATE gifts SET purchased = "no" WHERE gift_id = ?', [item], 
				function(tx, rs){
					app.giftsforoccasion();			
				},
				function(tx, err){
					//failed to run query
					alert( err.message);
				});
			}
        }); 
	
		app.giftsforoccasion();
	}
}
	
app.initialize();