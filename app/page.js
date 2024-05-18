'use client'; // Specifies that the code should be executed in "strict mode"

import { useState } from "react"; // Importing useState hook from React for managing state
import Image from "next/image"; // Importing Image component from Next.js for optimized images
import img from '../public/images/image.png' // Importing an image
import './styles.css' // Importing CSS styles

// Function to pause execution for a specified time
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Home component
const Home = () => {
   
    // State variables for prediction, error and loading status
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);
    const [loading,setLoading]=useState(false);
 
    // Function to handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault(); // Prevents the page from reloading on form submission

      // Fetching JSON data from the server
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: e.target.prompt.value, // The value entered in the input field
        }),
      });

      let prediction = await response.json(); // Parsing the response to JSON

      // Checking if the prompt is empty or if the response status is not 201
      if(response.prompt==="") return 0;
      if (response.status !== 201) {
        setLoading(true); // Setting loading to true
        setError(prediction.detail); 
        return;
      }
      setPrediction(prediction); 
  
      // Loop to check the status of the prediction
      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await sleep(1000); // Pausing execution for 1 second
        const response = await fetch("/api/predictions/" + prediction.id); // Fetching the prediction by id
        
        prediction = await response.json(); 
        if (response.status !== 200) {
          setError(prediction.detail); // Setting the error message
          setLoading(true); 
          return;
        }
        // console.log({ prediction }); 
        setPrediction(prediction); // Setting the prediction
      }
    };
    
    // Rendering the component
    return (
      <div className='ai-img-gen'>
        <div className="header">AI image <span>Generator</span></div>
        <div className="img-loading">
        <Image className="img"
                src={img} 
                alt="no image generated" 
                width={500} 
                height={500} 
                priority={true} 
              />
         
             {error && <div>{error}  
             {/* Displaying the error message if there is one */}
  
         {prediction && (
        <>
          {prediction.output && (
            <div className="img">
              
              <Image
                className='image'
                
                name='img'
                src={prediction.output[prediction.output.length - 1]} // The source of the output image
                alt="output" 
                width={500} 
                height={500} 
                priority={true} 
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p> 
          {/* Displaying the status of the prediction */}
          <div className={loading?"loader":loading}></div>
        </>
      )}
      </div>}
          
          </div>
  
          <div>
            {/* Form for entering the image description */}
            <form className="search-box" onSubmit={handleSubmit}>  
              
          <input
            type="text"
            className='search-input'
            name="prompt"
            placeholder="Describe your desired image" // Placeholder text for the input field
            
          />
          
          <button className="gen-btn" type="submit"> 
          
            Generate
          </button>
          {/* Button to submit the form */}
        </form>
              
            
          </div>
        </div>
      
    )
  
}
 
export default Home; // Exporting the Home component
