import pandas as pd
import json

# Leer el archivo Excel
file_path = 'ODScat_345.xlsx'
data = pd.read_excel(file_path)

# Asegúrate de que las columnas sean las esperadas
# Cambia 'Texto' y 'sdg' por los nombres de las columnas en tu archivo Excel
if 'Textos_espanol' not in data.columns or 'sdg' not in data.columns:
    raise ValueError("El archivo Excel debe contener las columnas 'Textos_espanol' y 'sdg'.")

# Agrupar los textos y sdg
grouped_data = data.groupby('sdg')['Textos_espanol'].apply(list).reset_index()

# Preparar el JSON de salida
retrain_data = {
    "Textos_espanol": [],
    "sdg": []
}

# Llenar el JSON con los datos agrupados
for index, row in grouped_data.iterrows():
    retrain_data['Textos_espanol'].extend(row['Textos_espanol'])
    retrain_data['sdg'].extend([row['sdg']] * len(row['Textos_espanol']))

# Guardar el JSON en un archivo de texto
output_file = 'test.txt'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(retrain_data, f, ensure_ascii=False, indent=4)

print(f"Archivo '{output_file}' creado con éxito.")
