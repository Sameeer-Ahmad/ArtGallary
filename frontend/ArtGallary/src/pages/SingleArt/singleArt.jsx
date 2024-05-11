const SingleArt = ({ match }) => {
    const { id } = match.params;
    // Find the painting with the matching id
    const painting = paintings.find((painting) => painting.id === id);
  
    return (
      <div>
        <h1>{painting.title}</h1>
        <p>{painting.description}</p>
        <img src={painting.image} alt={painting.title} />
      </div>
    );
  };
  
  export default SingleArt;