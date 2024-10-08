from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
import dill
from sklearn.metrics import confusion_matrix
import subprocess
import sys

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

@app.post("/predict")
def predict(instances: List[InstanceData]):
    # Extraer los textos para la predicción
    texts = [text for instance in instances for text in instance.Textos_espanol]
    
    # Convertir la lista a un DataFrame
    texts_df = pd.Series(texts)
    
    # Realizar las predicciones usando el pipeline cargado
    predictions = pipeline.predict(texts_df)
    
    # Obtener las probabilidades para cada predicción
    probabilities = pipeline.predict_proba(texts_df)
    
    # Formatear las probabilidades de forma legible
    probabilities_list = probabilities.tolist()
    
    # Retornar las predicciones y sus probabilidades
    return {
        "sdg": predictions.tolist(),  # Convertir las predicciones a lista si es necesario
        "probabilities": probabilities_list  # Retornar las probabilidades
    }

# Endpoint 2: Re-entrenamiento
@app.post("/retrain")
def retrain(data: RetrainData):
    try:
        # Cargar los datos del archivo Excel 'ODScat_345.xlsx'
        excel_df = pd.read_excel('ODScat_345.xlsx')
        
        # Asegurar que el archivo tenga las columnas necesarias
        if 'Textos_espanol' not in excel_df.columns or 'sdg' not in excel_df.columns:
            return {"error": "El archivo Excel no contiene las columnas necesarias."}
        
        # Convertir los datos recibidos en un DataFrame
        input_df = pd.DataFrame({'Textos_espanol': data.Textos_espanol, 'sdg': data.sdg})
        
        # Combinar los datos del Excel con los nuevos datos del input
        combined_df = pd.concat([excel_df, input_df], ignore_index=True)
        
        # Separar características y variable objetivo
        X = combined_df['Textos_espanol']
        y = combined_df['sdg']
        
        # Dividir los datos en entrenamiento y validación
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Re-entrenar el pipeline con los datos combinados
        pipeline.fit(X_train, y_train)
        
        # Realizar predicciones en el conjunto de prueba
        y_pred = pipeline.predict(X_test)
        
        # Calcular las métricas
        precision = precision_score(y_test, y_pred, average='macro')
        recall = recall_score(y_test, y_pred, average='macro')
        f1 = f1_score(y_test, y_pred, average='macro')
        
        # Generar matriz de confusión
        confusion_mat = confusion_matrix(y_test, y_pred)
        
        # Guardar el nuevo pipeline entrenado (sobreescribir el archivo)
        import dill
        with open('pipeline_logistic_reg.pkl', 'wb') as f:
            dill.dump(pipeline, f)
        
        # Retornar las métricas y la matriz de confusión
        return {
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "confusion_matrix": confusion_mat.tolist()
        }
    
    except Exception as e:
        return {"error": str(e)}
    
    
# Endpoint 3: Reestablecer al modelo de la etapa 1
@app.post("/reset")
def reset_pipeline():
    try:
        # Ejecutar el script 'pipeline_logistic_reg.py' para regenerar el pipeline original
        result = subprocess.run([sys.executable, "pipeline_logistic_reg.py"], capture_output=True, text=True)
        
        # Verificar si hubo algún error en la ejecución del script
        if result.returncode != 0:
            return {"error": "Error al ejecutar el script 'pipeline_logistic_reg.py'.", "details": result.stderr}

        # Cargar el pipeline nuevamente desde el archivo regenerado 'pipeline_logistic_reg.pkl'
        with open('pipeline_logistic_reg.pkl', 'rb') as f:
            global pipeline
            pipeline = dill.load(f)
        
        return {"message": "Pipeline reiniciado exitosamente.", "details": result.stdout}

    except Exception as e:
        return {"error": "Ocurrió un error al intentar reiniciar el pipeline.", "details": str(e)}

# Iniciar el servidor: uvicorn main:app --reload
