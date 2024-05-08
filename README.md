# ArtGallary

Access base role-

Artist- display their own work, update,delete
Artist profile- (artist info)
Artist portfolio-artwork

Collector-explore and purchase; filtering, searching , transaction process


userSchema-
ID,
username,
email,
password
role:[artist,collector]


artSchema-

ID,
artImage,
artPrice,
artTitle,
artCategory[painting,sculpture,photography,architecture,etc],
artDimension,
userID,
username


routes for  user-

---login

---signup 

---logout

---profile (username,useremail,userImage),
profile for both artist and collector but artPortfolio only for artist

---artPortfolio (inside artPortfolio we have to showcase every art details created by that particular artist)

---CRUD operations only for artist

routes for category-
painting
sculpture
photography
architecture
and so on


Chatbox-with ai integeration

Prashad -frontend
Rohan- backend
sameer-backend
