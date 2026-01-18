import yaml 

def open_yaml(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        PROMPTS = yaml.safe_load(f)
    return PROMPTS