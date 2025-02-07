import React, { useEffect, useState } from 'react'

function App() {
  const testAPI = async() => {
    const res = await fetch("http://localhost:5000/api/track-analyze", {
      method: "GET", 
      headers: {
        "Content-Type": "application/json", 
      }, 
      credentials: "include",
    })

    const data = await res.json(); 
    console.log(data);
  }; 

  testAPI(); 
  return (
    <div>asd</div>
  )
}

export default App