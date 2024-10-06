from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
import dill

# Definir la aplicación FastAPI
app = FastAPI()

# Cargar el pipeline desde un archivo local
PIPELINE_PATH = './pipeline_logistic_reg.pkl'

# Cargar el pipeline desde el archivo .pkl
def load_pipeline():
    try:
        with open(PIPELINE_PATH, 'rb') as f:
            return dill.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar el modelo: {str(e)}")

# Cargar el pipeline
pipeline = load_pipeline()


# Modelo para recibir los datos
class InstanceData(BaseModel):
    Textos_espanol: List[str]

class RetrainData(BaseModel):
    Textos_espanol: List[str]
    sdg: List[int]

# Endpoint 1: Predicción
@app.post("/predict")
def predict(instances: List[InstanceData]):
    # Extraer los textos para la predicción
    texts = [text for instance in instances for text in instance.Textos_espanol]
    
    # Convertir la lista a un DataFrame
    texts_df = pd.Series(texts)
    
    # Realizar las predicciones usando el pipeline cargado
    predictions = pipeline.predict(texts_df)
    
    # Retornar las predicciones
    return {"sdg": predictions.tolist()}  # Convertir a lista si es necesario

# Endpoint 2: Re-entrenamiento
@app.post("/retrain")
def retrain(data: RetrainData):
    # Convertir los datos en un DataFrame
    df = pd.DataFrame({'Textos_espanol': data.Textos_espanol, 'sdg': data.sdg})
    
    # Separar características y variable objetivo
    X = df['Textos_espanol']
    y = df['sdg']
    
    # Dividir los datos en entrenamiento y validación
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Re-entrenar el pipeline con los nuevos datos
    pipeline.fit(X_train, y_train)
    
    # Realizar predicciones en el conjunto de prueba
    y_pred = pipeline.predict(X_test)
    
    # Calcular las métricas
    precision = precision_score(y_test, y_pred, average='macro')
    recall = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    
    # Guardar el nuevo pipeline entrenado (sobreescribir el archivo)
    import dill
    with open('pipeline_logistic_reg.pkl', 'wb') as f:
        dill.dump(pipeline, f)
    
    # Retornar las métricas
    return {
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }

# Iniciar el servidor: uvicorn main:app --reload
