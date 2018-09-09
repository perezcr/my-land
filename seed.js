const Landscape = require('./models/landscape');
const Comment   = require('./models/comment');

var landscapes = [
   {
      name : "Salmon Creek",
      entranceFee : '5.50',
      image : "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201__340.jpg",
      author: {
         id: '5b1b6aea45ae47134773a5cf',
         username: 'Odie'
      },
      description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, repellendus porro obcaecati, sapiente officiis reiciendis labore, voluptatem doloribus voluptatum temporibus nam! Possimus minima illo eius nulla quod molestiae omnis nihil?"
   },
   {
      name : "Granite Hill", 
      entranceFee : '5.50',
      image : "https://cdn.pixabay.com/photo/2016/11/21/15/14/camping-1845906__340.jpg",
      author: {
         id: '5b2b6aea45ae47134773a5cf',
         username: 'Cat'
      },
      description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, repellendus porro obcaecati, sapiente officiis reiciendis labore, voluptatem doloribus voluptatum temporibus nam! Possimus minima illo eius nulla quod molestiae omnis nihil?"
   },
   {
      name : "Mountain Goat's Rest", 
      entranceFee : '5.50',
      image : "https://cdn.pixabay.com/photo/2016/01/19/16/48/teepee-1149402__340.jpg",
      author: {
         id: '5b3b6aea45ae47134773a5cf',
         username: 'Dog'
      },
      description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, repellendus porro obcaecati, sapiente officiis reiciendis labore, voluptatem doloribus voluptatum temporibus nam! Possimus minima illo eius nulla quod molestiae omnis nihil?"
   }
];

function seedDB(){
   Landscape.remove({}, (err) => {
      if(err){
         console.log(err);
      }
      console.log('Removed landscapes');
      landscapes.forEach((landscape) => {
         Landscape.create(landscape, (err, newLandscape) => {
            if(err){
               console.log(err);
            } else{
               console.log('Added a landscape');
               Comment.create({
                  text: 'This place is great, but I wish there was internet',
                  author: {
                     id: '5b9b6aea45ae47134773a5cf',
                     username: 'Homero'
                  }
               }, (err, newComment) => {
                  if(err){
                     console.log(err);
                  } else{
                     newLandscape.comments.push(newComment);
                     newLandscape.save();
                     console.log("Created new comment");
                  }
               });
            }
         });
      });   
   });
}

module.exports = seedDB;