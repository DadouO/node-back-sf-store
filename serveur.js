const express = require('express');
const app = express();
//faire marcher express = export NODE_PATH='/usr/lib/node_modules' à mettre dans le bash rc
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.listen(8888);

app.use(function(req,res, next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers','*');
    next();
});
//app.use(require('cors'));

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = "mongodb://localhost:27017";

MongoClient.connect(url,{useNewUrlParser: true}, (err, client)=>{
    let db = client.db("SFSTORE");

    /* Liste des produits */
    app.get('/produits',(req, res)=>{
        console.log("/produits");
        try{
            db.collection("products").find().toArray((err, documents) =>{
                res.end(JSON.stringify(documents));
            });
        } catch(e){
            console.log("Erreur sur /produits : " + e);
            res.end(JSON.stringify([]));
        }

    });

    /* Liste des catégories de produits */
    app.get("/categories",(req, res)=>{
        console.log("/categories");
        categories = [];
        try{
            db.collection("products").find().toArray((err, documents) => {
                for (let doc of documents){
                    if(!categories.includes(doc.type)) categories.push(doc.type);
                }
                console.log("Renvoi de " +JSON.stringify(categories));
                res.end(JSON.stringify(categories));
            });
        } catch(e){
            console.log("Erreur sur /categories : " + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Recherche par catégorie */
    app.get('/produits/categorie/:categorie',(req, res)=>{
        let categorie = req.params.categorie;
        console.log("/produits/categorie/"+categorie);
        try{
            db.collection("products").find({type:categorie}).toArray((err, documents) =>{
                res.end(JSON.stringify(documents));
            });
        } catch(e){
            console.log("Erreur sur /produits/categorie/ : " + categorie + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Recherche par auteur */
    app.get('/produits/auteur/:auteur',(req, res)=>{
        let auteur = req.params.auteur;
        console.log("/produits/auteur/"+auteur);
        try{
            db.collection("products").find({auteur:auteur}).toArray((err, documents) =>{
                res.end(JSON.stringify(documents));
            });
        } catch(e){
            console.log("Erreur sur /produits/auteur : " + auteur + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Recherche par produits */
    app.get('/produits/:nom',(req, res)=>{
        let nom = req.params.nom;
        console.log("/produits/"+nom);
        try{
            db.collection("products").find({nom:nom}).toArray((err, documents) =>{
                res.end(JSON.stringify(documents));
            });
        } catch(e){
            console.log("Erreur sur /produits/ : " + nom + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Connexion */
    app.post("/utilisateur/connexion",(req,res)=>{
        console.log("/utilisateur/connexion avec "+JSON.stringify(req.body));
        try{
            db.collection('users').find(req.body).toArray((err,documents)=>{
                if (documents.length == 1)
                    res.end(JSON.stringify({"resultat":1, "message":"Authentification réussie"}));
                else res.end(JSON.stringify({"resultat":0, 
                "message":"Email et/ou mot de passe incorrect"}));
            });
        } catch(e){
            res.end(JSON.stringify({"resultat":0,"message": e}));
        }
    });

    /* Déconnexion */
    app.get("/utilisateur/deconnexion/:email",(req, res)=>{
        let email = req.params.email;
        console.log("/utilisateur/deconnexion/"+email);
        try{
            db.collection("users").find({email:email}).toArray((err, documents) =>{
                //res.end(JSON.stringify(documents));
                if (documents.length == 1)
                    res.end(JSON.stringify({"resultat":1, "message":"Déconnexion réussie"}));
                else res.end(JSON.stringify({"resultat":0, 
                "message":"Email incorrect"}));
            });
        } catch(e){
            console.log("Erreur sur /utilisateur/deconnexion/ : " + email + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Panier */
    app.get("/utilisateur/panier/:email",(req, res)=>{
        let email = req.params.email;
        console.log("/utilisateur/panier/"+email);
        try{
            db.collection("basket").find({email:email}).toArray((err, documents) =>{
                res.end(JSON.stringify(documents));
            });
        } catch(e){
            console.log("Erreur sur /utilisateur/panier/ : " + email + e);
            res.end(JSON.stringify([]));
        }
    });

    /* commande Panier */
    app.get("/utilisateur/panier/reset/:email", (req,res) => {
        let email = req.params.email;
            console.log("Dans /utilisateur/panier/reset/"+email);
            try{
            db.collection("basket").update({email:email}, {$set: {produits: []}});
            res.end(JSON.stringify("cart reset done"));
            } catch(e){
                console.log("Erreur sur /utilisateur/panier/ : " + email + e);
                res.end(JSON.stringify([]));
            }
        });    


        /* nom produit Panier */
        app.get("/utilisateur/produit/:email/:nom",(req, res)=>{
            let email = req.params.email;
            let nom = req.params.nom;
            console.log("/utilisateur/produit/"+email+"/"+nom);
            try{
                db.collection("basket").find({email:email},{projection : {"produits[0].nom":nom}}).toArray((err, documents) =>{
                    res.end(JSON.stringify(documents));
                });
            } catch(e){
                console.log("Erreur sur /utilisateur/produit/"+email+"/"+nom+ e);
                res.end(JSON.stringify([]));
            }
        });
    
        app.get("/utilisateur/produitbis/:email/:nom",(req, res)=>{
            let email = req.params.email;
            let nom = req.params.nom;
            console.log("/utilisateur/produit/"+email+"/"+nom);
            try{
                db.collection("basket").find({email:email}).toArray((err, documents) =>{
                    //console.log(documents[0].produits.nom);
                    //let firstb = documents[0].nom;
                    if (documents !== undefined && documents[0] !== undefined){
                        let firstb = documents[0].produits[0].nom;
                        res.end(JSON.stringify(firstb));
                    }else res.end(JSON.stringify([]));
                    
                });
            } catch(e){
                console.log("Erreur sur /utilisateur/produit/"+email+"/"+nom+ e);
                res.end(JSON.stringify([]));
            }
        });

        /*Ajout de produit à panier*/
        app.post("/produits/panier/add",(req, res)=>{
            let email = req.body.email;
            let nom = req.body.nom;
            let productTarget = {};
            let newbasket = []; 
            console.log("/produits/panier/add" + " ajout avec post"+email+"/"+nom);
            try{
                db.collection("products").find({nom:nom}).toArray((err, documents) =>{
                    if (documents !== undefined && documents[0] !== undefined){
                        // console.log(documents);
                        productTarget = {"nom":documents[0].nom,"auteur":documents[0].auteur,
                        "prix":documents[0].prix,"quantité":1};
                        };
                        //  console.log(productTarget);
                    });
                         db.collection("basket").find({email:email}).toArray((error,doc)=>{
                             let currentbasket = doc[0].produits;
                             console.log(currentbasket);
                             if(currentbasket.length !=0){
                                console.log("non ce n'est pas un array vide!!!!!");
                             currentbasket.forEach(element => {
                                // console.log(element.nom);
                                if(element.nom!== nom){
                                    console.log(element.nom);
                                    newbasket.push(element);
                                } else{
                                    //handle quantité
                                    let quantity = element.quantité;
                                    console.log(element.quantité);
                                    productTarget.quantité = quantity+1;
                                    console.log(productTarget.quantité);
                                    // console.log(productTarget);
                                }
                         })
                         console.log("NEW BASKET après la boucle",newbasket);
                         newbasket.push(productTarget);
                         console.log("NEW BASKET après le push",newbasket);
                         db.collection("basket").update({email:email}, {$set: {produits: newbasket}});
                        }
                        else{
                            console.log("NEW BASKET si array vide");
                            newbasket.push(productTarget); 
                            console.log("après le push si array vide",newbasket);
                            db.collection("basket").update({email:email}, {$set: {produits: newbasket}});

                        }
                });

                res.end(JSON.stringify("ajout produit"));
            } catch(e){
                console.log("Erreur sur /produits/panier/add " + " ajout avec post" +email+"/"+nom+ e);
                res.end(JSON.stringify([]));
            }
        });
});

//app.listen(8888);