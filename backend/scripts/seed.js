// One-off seed script: pulls real, verified public-domain artwork data
// from the Wikimedia Commons API and inserts it as demo listings.
// Run with: node scripts/seed.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { connectToDB } = require("../config/db");
const { ArtModel } = require("../model/art.model");
const { userModel } = require("../model/user.model");

const CURATOR = {
  username: "The Artline Curator",
  email: "curator@theartline.demo",
  password: "curator123",
  role: "artist",
};

// [artCategory, [ { artistName, searchTerm } ]] — each entry targets one
// distinct artwork. Multiple entries can share an artistName (a gallery
// naturally carries several pieces by the same artist).
const PLAN = [
  [
    "Painting",
    [
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh painting landscape" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Sunflowers painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Cafe Terrace painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Irises painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Wheatfield painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Self-Portrait painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Almond Blossoms painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Bedroom Arles painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Olive Trees painting" },
      { artistName: "Vincent van Gogh", searchTerm: "Van Gogh Wheatfield Crows painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet water lilies painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Impression Sunrise painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Haystacks painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Rouen Cathedral painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Poppy Field painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Japanese Bridge painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Woman with Parasol painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Garden painting" },
      { artistName: "Claude Monet", searchTerm: "Claude Monet Waterloo Bridge painting" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai painting" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai Fuji painting" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai dragon painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt landscape painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt portrait painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt Beethoven Frieze painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt Judith painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt Danae painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt Tree of Life painting" },
      { artistName: "Gustav Klimt", searchTerm: "Gustav Klimt Adele Bloch-Bauer painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Johannes Vermeer painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Vermeer Milkmaid painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Vermeer Astronomer painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Vermeer Music Lesson painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Vermeer Officer Laughing Girl painting" },
      { artistName: "Johannes Vermeer", searchTerm: "Vermeer Woman Reading Letter painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt self portrait painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt Night Watch painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt Anatomy Lesson painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt Jewish Bride painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt portrait old man painting" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt Man with Golden Helmet painting" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci Mona Lisa painting" },
      { artistName: "Sandro Botticelli", searchTerm: "Sandro Botticelli Venus painting" },
      { artistName: "Raphael", searchTerm: "Raphael Madonna painting" },
      { artistName: "Titian", searchTerm: "Titian Venus painting" },
      { artistName: "Caravaggio", searchTerm: "Caravaggio painting" },
      { artistName: "Diego Velázquez", searchTerm: "Diego Velazquez Las Meninas painting" },
      { artistName: "Francisco Goya", searchTerm: "Francisco Goya painting" },
      { artistName: "J.M.W. Turner", searchTerm: "J.M.W. Turner ship painting" },
      { artistName: "John Constable", searchTerm: "John Constable landscape painting" },
      { artistName: "Édouard Manet", searchTerm: "Edouard Manet painting" },
      { artistName: "Pierre-Auguste Renoir", searchTerm: "Pierre-Auguste Renoir painting" },
      { artistName: "Edgar Degas", searchTerm: "Edgar Degas ballet painting" },
      { artistName: "Paul Gauguin", searchTerm: "Paul Gauguin Tahiti painting" },
      { artistName: "Paul Cézanne", searchTerm: "Paul Cezanne still life painting" },
      { artistName: "Georges Seurat", searchTerm: "Georges Seurat pointillism painting" },
      { artistName: "Gustave Courbet", searchTerm: "Gustave Courbet painting" },
      { artistName: "Jean-Auguste-Dominique Ingres", searchTerm: "Jean-Auguste-Dominique Ingres painting" },
      { artistName: "Eugène Delacroix", searchTerm: "Eugene Delacroix painting" },
      { artistName: "William Blake", searchTerm: "William Blake painting" },
      { artistName: "Thomas Gainsborough", searchTerm: "Thomas Gainsborough painting" },
      { artistName: "El Greco", searchTerm: "El Greco painting" },
      { artistName: "Peter Paul Rubens", searchTerm: "Peter Paul Rubens painting" },
      { artistName: "Jan van Eyck", searchTerm: "Jan van Eyck painting" },
      { artistName: "Pieter Bruegel the Elder", searchTerm: "Pieter Bruegel the Elder painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Saraswati painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Shakuntala painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Lakshmi painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Damayanti painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Draupadi painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma portrait painting" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma mythology painting" },
      { artistName: "Abanindranath Tagore", searchTerm: "Abanindranath Tagore painting" },
      { artistName: "Nandalal Bose", searchTerm: "Nandalal Bose painting" },
      { artistName: "Amrita Sher-Gil", searchTerm: "Amrita Sher-Gil painting" },
      { artistName: "Jamini Roy", searchTerm: "Jamini Roy painting" },
      { artistName: "Gaganendranath Tagore", searchTerm: "Gaganendranath Tagore painting" },
      { artistName: "Rabindranath Tagore", searchTerm: "Rabindranath Tagore painting" },
      { artistName: "Unknown, Mughal School", searchTerm: "Mughal miniature painting" },
      { artistName: "Unknown, Rajput School", searchTerm: "Rajput miniature painting" },
      { artistName: "Unknown, Company School", searchTerm: "Company School painting India" },
      { artistName: "Unknown, Kalighat School", searchTerm: "Kalighat painting" },
    ],
  ],
  [
    "Sculpture",
    [
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin bronze sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin The Kiss sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin Gates of Hell sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin marble sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin study sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin torso sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo marble sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo Moses sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo Bacchus sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo Medici tomb sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo unfinished slave sculpture" },
      { artistName: "Unknown, Ancient Greece", searchTerm: "ancient Greek marble sculpture" },
      { artistName: "Edgar Degas", searchTerm: "Edgar Degas bronze sculpture dancer" },
      { artistName: "Donatello", searchTerm: "Donatello sculpture" },
      { artistName: "Donatello", searchTerm: "Donatello marble relief sculpture" },
      { artistName: "Donatello", searchTerm: "Donatello Saint George sculpture" },
      { artistName: "Donatello", searchTerm: "Donatello bronze relief sculpture" },
      { artistName: "Donatello", searchTerm: "Donatello Judith Holofernes sculpture" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin The Thinker sculpture" },
      { artistName: "Antonio Canova", searchTerm: "Antonio Canova sculpture" },
      { artistName: "Gian Lorenzo Bernini", searchTerm: "Gian Lorenzo Bernini sculpture" },
      { artistName: "Unknown, Ancient Rome", searchTerm: "ancient Roman marble bust sculpture" },
      { artistName: "Unknown, Ancient Egypt", searchTerm: "ancient Egyptian sculpture statue" },
      { artistName: "Praxiteles", searchTerm: "Praxiteles Greek sculpture" },
      { artistName: "Jean-Antoine Houdon", searchTerm: "Jean-Antoine Houdon sculpture bust" },
      { artistName: "Edgar Degas", searchTerm: "Edgar Degas Little Dancer sculpture" },
      { artistName: "Donatello", searchTerm: "Donatello bronze David sculpture" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo Pieta sculpture" },
      { artistName: "Unknown, Ancient Greece", searchTerm: "ancient Greek bronze sculpture" },
      { artistName: "Unknown, Ancient Assyria", searchTerm: "Assyrian relief sculpture" },
      { artistName: "Unknown", searchTerm: "ancient Buddhist stone sculpture" },
      { artistName: "Unknown", searchTerm: "medieval stone sculpture cathedral" },
      { artistName: "Unknown, Renaissance Florence", searchTerm: "Renaissance marble sculpture Florence" },
      { artistName: "Auguste Rodin", searchTerm: "Auguste Rodin Burghers of Calais sculpture" },
      { artistName: "Aristide Maillol", searchTerm: "Aristide Maillol sculpture" },
      { artistName: "Frederic Remington", searchTerm: "Frederic Remington bronze sculpture" },
      { artistName: "Augustus Saint-Gaudens", searchTerm: "Augustus Saint-Gaudens sculpture" },
      { artistName: "Daniel Chester French", searchTerm: "Daniel Chester French sculpture" },
      { artistName: "Unknown, Ancient India", searchTerm: "Khajuraho temple sculpture" },
      { artistName: "Unknown, Ancient India", searchTerm: "Ellora caves sculpture" },
      { artistName: "Unknown, Ancient India", searchTerm: "Ajanta caves sculpture" },
      { artistName: "Unknown, Chola Dynasty", searchTerm: "Chola bronze Nataraja sculpture" },
      { artistName: "Unknown, Ancient India", searchTerm: "Mahabalipuram sculpture relief" },
      { artistName: "Unknown, Ancient India", searchTerm: "Sanchi stupa sculpture" },
      { artistName: "Unknown, Gandhara", searchTerm: "Gandhara Buddha sculpture" },
      { artistName: "Unknown, Ancient India", searchTerm: "Konark temple sculpture" },
      { artistName: "Unknown, Hoysala Empire", searchTerm: "Hoysala temple sculpture" },
      { artistName: "Unknown, Mughal Empire", searchTerm: "Mughal stone jali carving" },
    ],
  ],
  [
    "Photography",
    [
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz photograph" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz New York photograph" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz portrait photograph" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz Georgia O'Keeffe photograph" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz clouds photograph" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz street photograph" },
      { artistName: "Eadweard Muybridge", searchTerm: "Eadweard Muybridge photograph" },
      { artistName: "Eadweard Muybridge", searchTerm: "Eadweard Muybridge horse motion photograph" },
      { artistName: "Eadweard Muybridge", searchTerm: "Eadweard Muybridge animal locomotion photograph" },
      { artistName: "Julia Margaret Cameron", searchTerm: "Julia Margaret Cameron photograph portrait" },
      { artistName: "Edward Steichen", searchTerm: "Edward Steichen photograph" },
      { artistName: "Gustave Le Gray", searchTerm: "Gustave Le Gray photograph seascape" },
      { artistName: "Dorothea Lange", searchTerm: "Dorothea Lange Farm Security Administration photograph" },
      { artistName: "Walker Evans", searchTerm: "Walker Evans Farm Security Administration photograph" },
      { artistName: "Mathew Brady", searchTerm: "Mathew Brady Civil War photograph" },
      { artistName: "Timothy H. O'Sullivan", searchTerm: "Timothy O'Sullivan Civil War photograph" },
      { artistName: "Nadar", searchTerm: "Nadar photograph portrait" },
      { artistName: "Édouard Baldus", searchTerm: "Edouard Baldus photograph" },
      { artistName: "Roger Fenton", searchTerm: "Roger Fenton Crimean War photograph" },
      { artistName: "Francis Frith", searchTerm: "Francis Frith photograph" },
      { artistName: "Carleton Watkins", searchTerm: "Carleton Watkins Yosemite photograph" },
      { artistName: "William Henry Fox Talbot", searchTerm: "William Henry Fox Talbot photograph" },
      { artistName: "Eugène Atget", searchTerm: "Eugene Atget Paris photograph" },
      { artistName: "Lewis Hine", searchTerm: "Lewis Hine child labor photograph" },
      { artistName: "Jacob Riis", searchTerm: "Jacob Riis tenement photograph" },
      { artistName: "Berenice Abbott", searchTerm: "Berenice Abbott New York photograph" },
      { artistName: "Arnold Genthe", searchTerm: "Arnold Genthe photograph" },
      { artistName: "Frances Benjamin Johnston", searchTerm: "Frances Benjamin Johnston photograph" },
      { artistName: "Wilhelm von Gloeden", searchTerm: "Wilhelm von Gloeden photograph" },
      { artistName: "Julia Margaret Cameron", searchTerm: "Julia Margaret Cameron photograph Tennyson" },
      { artistName: "Alfred Stieglitz", searchTerm: "Alfred Stieglitz Equivalent cloud photograph" },
      { artistName: "Raja Deen Dayal", searchTerm: "Raja Deen Dayal photograph India" },
      { artistName: "Raja Deen Dayal", searchTerm: "Lala Deen Dayal photograph" },
      { artistName: "Samuel Bourne", searchTerm: "Samuel Bourne photograph India" },
      { artistName: "Felice Beato", searchTerm: "Felice Beato photograph India" },
      { artistName: "Bourne & Shepherd", searchTerm: "Bourne and Shepherd photograph India" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage photograph Taj Mahal 19th century" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage photograph Varanasi Ganges 19th century" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage photograph Calcutta 19th century" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage photograph Bombay 19th century" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage photograph Indian maharaja" },
    ],
  ],
  [
    "Drawing",
    [
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci drawing sketch" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci anatomy drawing" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci Vitruvian Man drawing" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci machine drawing" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci horse drawing" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci study drawing" },
      { artistName: "Leonardo da Vinci", searchTerm: "Leonardo da Vinci portrait drawing" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt ink drawing" },
      { artistName: "Edgar Degas", searchTerm: "Edgar Degas pastel drawing dancer" },
      { artistName: "Albrecht Dürer", searchTerm: "Albrecht Durer drawing" },
      { artistName: "Michelangelo", searchTerm: "Michelangelo drawing study" },
      { artistName: "Raphael", searchTerm: "Raphael drawing study" },
      { artistName: "Peter Paul Rubens", searchTerm: "Peter Paul Rubens drawing" },
      { artistName: "Jean-Auguste-Dominique Ingres", searchTerm: "Ingres drawing portrait" },
      { artistName: "Eugène Delacroix", searchTerm: "Eugene Delacroix drawing" },
      { artistName: "Henri de Toulouse-Lautrec", searchTerm: "Toulouse-Lautrec drawing sketch" },
      { artistName: "Francisco Goya", searchTerm: "Francisco Goya drawing" },
      { artistName: "William Blake", searchTerm: "William Blake drawing illustration" },
      { artistName: "John Singer Sargent", searchTerm: "John Singer Sargent charcoal drawing" },
      { artistName: "Winslow Homer", searchTerm: "Winslow Homer watercolor drawing" },
      { artistName: "Gustave Doré", searchTerm: "Gustave Dore drawing illustration" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai drawing sketch" },
      { artistName: "Paul Cézanne", searchTerm: "Paul Cezanne watercolor drawing" },
      { artistName: "Odilon Redon", searchTerm: "Odilon Redon drawing" },
      { artistName: "Georges Seurat", searchTerm: "Georges Seurat conte crayon drawing" },
      { artistName: "Camille Pissarro", searchTerm: "Camille Pissarro drawing" },
      { artistName: "Berthe Morisot", searchTerm: "Berthe Morisot pastel drawing" },
      { artistName: "Mary Cassatt", searchTerm: "Mary Cassatt pastel drawing" },
      { artistName: "Edward Burne-Jones", searchTerm: "Edward Burne-Jones drawing study" },
      { artistName: "Dante Gabriel Rossetti", searchTerm: "Dante Gabriel Rossetti drawing" },
      { artistName: "Thomas Rowlandson", searchTerm: "Thomas Rowlandson drawing caricature" },
      { artistName: "Abanindranath Tagore", searchTerm: "Abanindranath Tagore drawing sketch" },
      { artistName: "Nandalal Bose", searchTerm: "Nandalal Bose drawing sketch" },
      { artistName: "Rabindranath Tagore", searchTerm: "Rabindranath Tagore drawing doodle" },
      { artistName: "Gaganendranath Tagore", searchTerm: "Gaganendranath Tagore drawing" },
      { artistName: "Unknown, Mughal School", searchTerm: "Mughal ink drawing" },
      { artistName: "Unknown, Rajput School", searchTerm: "Rajput drawing sketch" },
    ],
  ],
  [
    "Print",
    [
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai woodblock print" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai Thirty-six Views print" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai waterfall print" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai bridge print" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai flowers print" },
      { artistName: "Katsushika Hokusai", searchTerm: "Hokusai warrior print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige woodblock print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige Fifty-three Stations print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige bird flower print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige snow scene print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige moon print" },
      { artistName: "Utagawa Hiroshige", searchTerm: "Hiroshige bridge print" },
      { artistName: "Kitagawa Utamaro", searchTerm: "Utamaro woodblock print" },
      { artistName: "Albrecht Dürer", searchTerm: "Albrecht Durer engraving print" },
      { artistName: "Henri de Toulouse-Lautrec", searchTerm: "Toulouse-Lautrec lithograph poster" },
      { artistName: "Rembrandt", searchTerm: "Rembrandt etching print" },
      { artistName: "Francisco Goya", searchTerm: "Francisco Goya etching print" },
      { artistName: "William Hogarth", searchTerm: "William Hogarth engraving print" },
      { artistName: "Suzuki Harunobu", searchTerm: "Suzuki Harunobu woodblock print" },
      { artistName: "Utagawa Kuniyoshi", searchTerm: "Utagawa Kuniyoshi woodblock print" },
      { artistName: "Toyohara Kunichika", searchTerm: "Toyohara Kunichika woodblock print" },
      { artistName: "Jules Chéret", searchTerm: "Jules Cheret lithograph poster" },
      { artistName: "Édouard Vuillard", searchTerm: "Edouard Vuillard lithograph" },
      { artistName: "Pierre Bonnard", searchTerm: "Pierre Bonnard lithograph" },
      { artistName: "James McNeill Whistler", searchTerm: "James McNeill Whistler etching" },
      { artistName: "Honoré Daumier", searchTerm: "Honore Daumier lithograph caricature" },
      { artistName: "Gustave Doré", searchTerm: "Gustave Dore wood engraving" },
      { artistName: "Albrecht Dürer", searchTerm: "Albrecht Durer woodcut print" },
      { artistName: "Martin Schongauer", searchTerm: "Martin Schongauer engraving print" },
      { artistName: "Katsukawa Shunshō", searchTerm: "Katsukawa Shunsho woodblock print" },
      { artistName: "Torii Kiyonaga", searchTerm: "Torii Kiyonaga woodblock print" },
      { artistName: "Mary Cassatt", searchTerm: "Mary Cassatt drypoint print" },
      { artistName: "Odilon Redon", searchTerm: "Odilon Redon lithograph" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Press oleograph print" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma lithograph print" },
      { artistName: "Unknown, Kalighat School", searchTerm: "Kalighat print" },
      { artistName: "Unknown, Company School", searchTerm: "Company School engraving print India" },
      { artistName: "Unknown, Colonial India", searchTerm: "vintage engraving print India colonial" },
    ],
  ],
  [
    "Inspiration",
    [
      { artistName: "J.M.W. Turner", searchTerm: "J.M.W. Turner painting sunset" },
      { artistName: "Caspar David Friedrich", searchTerm: "Caspar David Friedrich painting landscape" },
      { artistName: "James McNeill Whistler", searchTerm: "Whistler nocturne painting" },
      { artistName: "John Singer Sargent", searchTerm: "John Singer Sargent painting" },
      { artistName: "Paul Cézanne", searchTerm: "Paul Cezanne painting" },
      { artistName: "Ivan Aivazovsky", searchTerm: "Ivan Aivazovsky seascape painting" },
      { artistName: "Albert Bierstadt", searchTerm: "Albert Bierstadt landscape painting" },
      { artistName: "Thomas Cole", searchTerm: "Thomas Cole landscape painting" },
      { artistName: "Frederic Edwin Church", searchTerm: "Frederic Edwin Church landscape painting" },
      { artistName: "John Everett Millais", searchTerm: "John Everett Millais painting" },
      { artistName: "Dante Gabriel Rossetti", searchTerm: "Dante Gabriel Rossetti painting" },
      { artistName: "Edward Burne-Jones", searchTerm: "Edward Burne-Jones painting" },
      { artistName: "Gustave Moreau", searchTerm: "Gustave Moreau painting" },
      { artistName: "Odilon Redon", searchTerm: "Odilon Redon painting" },
      { artistName: "Henri Rousseau", searchTerm: "Henri Rousseau painting jungle" },
      { artistName: "Camille Corot", searchTerm: "Camille Corot landscape painting" },
      { artistName: "Camille Pissarro", searchTerm: "Camille Pissarro landscape painting" },
      { artistName: "Alfred Sisley", searchTerm: "Alfred Sisley landscape painting" },
      { artistName: "Winslow Homer", searchTerm: "Winslow Homer seascape painting" },
      { artistName: "George Inness", searchTerm: "George Inness landscape painting" },
      { artistName: "Caspar David Friedrich", searchTerm: "Caspar David Friedrich moonlight painting" },
      { artistName: "Ivan Shishkin", searchTerm: "Ivan Shishkin landscape painting" },
      { artistName: "Isaac Levitan", searchTerm: "Isaac Levitan landscape painting" },
      { artistName: "Arkhip Kuindzhi", searchTerm: "Arkhip Kuindzhi landscape painting" },
      { artistName: "Nicholas Roerich", searchTerm: "Nicholas Roerich mountain painting" },
      { artistName: "Unknown, Mughal School", searchTerm: "Mughal miniature painting garden" },
      { artistName: "Unknown, Rajput School", searchTerm: "Rajput painting Krishna Radha" },
      { artistName: "Unknown, Pahari School", searchTerm: "Pahari miniature painting India" },
      { artistName: "Raja Ravi Varma", searchTerm: "Raja Ravi Varma Radha Krishna painting" },
      { artistName: "Unknown, Tanjore School", searchTerm: "Tanjore painting India" },
      { artistName: "Unknown, Mughal School", searchTerm: "Taj Mahal Mughal painting" },
    ],
  ],
];

// True acrylic-medium paintings are almost all still under copyright
// (acrylic paint dates to the mid-20th century), so "Acrylic" is
// intentionally left unseeded rather than mislabeling someone else's work.

const DIMENSIONS = ["40 x 50 cm", "50 x 70 cm", "60 x 90 cm", "70 x 100 cm", "80 x 120 cm"];

const isLicenseSafe = (extmetadata) => {
  const license = (extmetadata?.LicenseShortName?.value || "").toLowerCase();
  return (
    license.includes("public domain") ||
    license === "cc0" ||
    license.startsWith("cc by")
  );
};

const findImageFor = async (searchTerm, usedTitles) => {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: searchTerm,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1000",
    format: "json",
  }).toString();

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ArtlineDemoSeed/1.0 (local dev seed script; contact: dev@theartline.demo)",
    },
  });
  const data = await response.json();
  const pages = Object.values(data?.query?.pages || {});

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!/\.(jpe?g|png)$/i.test(page.title)) continue;
    if (!isLicenseSafe(info.extmetadata)) continue;
    const title = page.title.replace(/^File:/, "").replace(/\.[^.]+$/, "");
    if (usedTitles.has(title)) continue;
    return { imageUrl: info.thumburl, title };
  }
  return null;
};

const randomPrice = () => Math.floor(1500 + Math.random() * 13500);
const randomDimension = () => DIMENSIONS[Math.floor(Math.random() * DIMENSIONS.length)];
const randomStock = () => (Math.random() < 0.15 ? 0 : Math.floor(1 + Math.random() * 7));

async function seed() {
  await connectToDB();

  let curator = await userModel.findOne({ email: CURATOR.email });
  if (!curator) {
    const hashedPassword = await bcrypt.hash(CURATOR.password, 10);
    curator = await userModel.create({
      username: CURATOR.username,
      email: CURATOR.email,
      password: hashedPassword,
      role: CURATOR.role,
    });
    console.log(`Created curator account (${CURATOR.email} / ${CURATOR.password})`);
  }

  const existingArt = await ArtModel.find({}, "artCategory artName");
  const usedTitles = new Set(existingArt.map((a) => `${a.artCategory}::${a.artName}`));

  let inserted = 0;
  let skipped = 0;

  for (const [artCategory, items] of PLAN) {
    const categoryUsedTitles = new Set(
      [...usedTitles].filter((key) => key.startsWith(`${artCategory}::`)).map((key) => key.split("::")[1])
    );

    for (const { artistName, searchTerm } of items) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const found = await findImageFor(searchTerm, categoryUsedTitles);
      if (!found) {
        console.log(`Skipped (no new safe image found): ${searchTerm}`);
        skipped++;
        continue;
      }

      await ArtModel.create({
        artImage: [found.imageUrl],
        artName: found.title,
        artPrice: randomPrice(),
        created_at: Date.now(),
        artCategory,
        artDimension: randomDimension(),
        stock: randomStock(),
        userID: curator._id.toString(),
        username: artistName,
      });
      categoryUsedTitles.add(found.title);
      usedTitles.add(`${artCategory}::${found.title}`);
      inserted++;
      console.log(`Inserted [${artCategory}] "${found.title}" by ${artistName}`);
    }
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
