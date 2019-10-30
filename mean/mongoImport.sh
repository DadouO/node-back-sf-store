#!/bin/sh
mongoimport --db SFSTORE --collection products --file products.json --jsonArray --drop
mongoimport --db SFSTORE --collection users --file users.json --jsonArray --drop
mongoimport --db SFSTORE --collection basket --file basket.json --jsonArray --drop

#db.basket.find().forEach(function(doc){for(let p in doc){print(p+":"+doc[p])}})
#db.basket.find({"produits.auteur":{"$in" :["Douglas Adams","Ayerdhal"]}})

