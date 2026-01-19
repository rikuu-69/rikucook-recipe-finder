import React, { useState } from 'react';
import { ChefHat, Plus, X, Loader2, Search } from 'lucide-react';

export default function App() {
  const [ingredients, setIngredients] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    const trimmed = currentInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setCurrentInput('');
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const findRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Given these ingredients: ${ingredients.join(', ')}, suggest 3 creative recipes I can make. For each recipe, provide:
1. Recipe name
2. Brief description (1 sentence)
3. Additional ingredients needed (if any)
4. Quick cooking time estimate

Format your response as JSON only, no markdown or preamble:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "additionalIngredients": ["item1", "item2"],
      "cookingTime": "X minutes"
    }
  ]
}`
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content.map(item => item.type === "text" ? item.text : "").join("\n");
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);
      setRecipes(parsed.recipes || []);
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-12 h-12 text-orange-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              RikuCook
            </h1>
          </div>
          <p className="text-xl text-gray-600">What's in your fridge?</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Your Ingredients</h2>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., chicken, tomatoes, garlic..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
            <button
              onClick={addIngredient}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full flex items-center gap-2 font-medium"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(ing)}
                    className="hover:bg-orange-200 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Find Recipes Button */}
          <button
            onClick={findRecipes}
            disabled={loading || ingredients.length === 0}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Finding Recipes...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Find Recipes
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-center">{error}</p>
          )}
        </div>

        {/* Recipes Display */}
        {recipes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Recipes</h2>
            {recipes.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {recipe.name}
                </h3>
                <p className="text-gray-600 mb-4 text-lg">{recipe.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {recipe.additionalIngredients && recipe.additionalIngredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Additional Ingredients:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {recipe.additionalIngredients.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Cooking Time:</h4>
                    <p className="text-gray-600">{recipe.cookingTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

4. **Commit changes**

## Step 3: Deploy to Vercel (Free & Easy!)

Now let's deploy your app to the web for FREE:

1. **Go to https://vercel.com**
2. Click **"Sign Up"** and choose **"Continue with GitHub"**
3. After connecting, click **"Add New..."** → **"Project"**
4. Find your `rikucook-recipe-finder` repository and click **"Import"**
5. Vercel will auto-detect it's a Vite project. Just click **"Deploy"**
6. Wait 1-2 minutes... ⏳
7. **BOOM!** 🎉 Your app is live!

You'll get a URL like: `https://rikucook-recipe-finder.vercel.app`

---

## Your Files Should Look Like This:
```
rikucook-recipe-finder/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
