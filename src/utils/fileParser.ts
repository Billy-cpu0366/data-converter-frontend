// 文件解析工具函数

export const parseFileToText = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'txt':
      return await parseTextFile(file);
    case 'json':
      return await parseJsonFile(file);
    case 'csv':
      return await parseCsvFile(file);
    case 'md':
      return await parseMarkdownFile(file);
    default:
      // 对于其他格式，尝试作为文本文件读取
      return await parseTextFile(file);
  }
};

const parseTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
};

const parseJsonFile = async (file: File): Promise<string> => {
  const text = await parseTextFile(file);
  try {
    const json = JSON.parse(text);
    return JSON.stringify(json, null, 2);
  } catch (error) {
    return text; // 如果不是有效的JSON，返回原始文本
  }
};

const parseCsvFile = async (file: File): Promise<string> => {
  const text = await parseTextFile(file);
  const lines = text.split('\n');
  
  // 简单的CSV解析，将其转换为更易读的格式
  const result = lines.map((line, index) => {
    if (index === 0) {
      return `标题行: ${line}`;
    }
    return `第${index}行: ${line}`;
  }).join('\n');
  
  return result;
};

const parseMarkdownFile = async (file: File): Promise<string> => {
  // Markdown文件直接返回内容
  return await parseTextFile(file);
};

// 生成示例文本内容
export const generateSampleText = (): string => {
  return `# 示例学习内容

## 第一章：基础概念

### 1.1 重要概念
这是一个重要的概念，需要理解和掌握。

### 1.2 关键知识点
- 知识点1：这是第一个重要的知识点
- 知识点2：这是第二个重要的知识点
- 知识点3：这是第三个重要的知识点

## 第二章：实践应用

### 2.1 应用场景
在实际应用中，我们需要考虑以下几个方面：

1. 场景分析
2. 解决方案
3. 实施步骤

### 2.2 注意事项
在实践过程中，需要特别注意以下几点：
- 安全性考虑
- 性能优化
- 用户体验

## 总结
通过学习以上内容，我们可以更好地理解和应用相关知识。`;
};

// 文件类型检测
export const getSupportedFileTypes = (): string[] => {
  return ['txt', 'json', 'csv', 'md'];
};

export const isFileSupported = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return getSupportedFileTypes().includes(extension || '');
};
