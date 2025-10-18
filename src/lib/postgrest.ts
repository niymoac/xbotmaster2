import { PostgrestClient } from "@supabase/postgrest-js";

const POSTGREST_URL = process.env.POSTGREST_URL || process.env.DATABASE_URL || "";
const POSTGREST_SCHEMA = process.env.POSTGREST_SCHEMA || "public";
const POSTGREST_API_KEY = process.env.POSTGREST_API_KEY || "";

if (!POSTGREST_URL) {
  console.warn('POSTGREST_URL veya DATABASE_URL environment variable bulunamadı');
}

/**
 * PostgREST client oluşturur
 */
export function createPostgrestClient(userToken?: string) {
  try {
    const client = new PostgrestClient(POSTGREST_URL, {
      schema: POSTGREST_SCHEMA,
      fetch: (url, options = {}) => {
        // URL düzeltmeleri
        let fetchUrl = url;
        
        if (typeof url === 'string' || url instanceof URL) {
          const urlObj = url instanceof URL ? url : new URL(url);
          
          // Columns parametresindeki çift tırnak işaretlerini düzelt
          const columns = urlObj.searchParams.get("columns");
          if (columns && columns.includes('"')) {
            const fixedColumns = columns.replace(/"/g, "");
            urlObj.searchParams.set("columns", fixedColumns);
            fetchUrl = urlObj.toString();
          }
        }

        // Request options ayarla
        const fetchOptions: RequestInit = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        };

        return fetch(fetchUrl, fetchOptions);
      },
    });

    // Default header'ları ayarla
    client.headers.set("Content-Type", "application/json");
    client.headers.set("Accept", "application/json");

    // User token varsa authorization header ekle
    if (userToken) {
      client.headers.set("Authorization", `Bearer ${userToken}`);
    }

    // API key varsa ekle
    if (POSTGREST_API_KEY) {
      client.headers.set("apikey", POSTGREST_API_KEY);
    }

    return client;
  } catch (error) {
    console.error('PostgREST client oluşturma hatası:', error);
    throw new Error('Database bağlantısı kurulamadı');
  }
}

/**
 * Database bağlantısını test eder
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = createPostgrestClient();
    
    // Basit bir query ile bağlantıyı test et
    const { error } = await client
      .from('users')
      .select('id')
      .limit(1)
      .single();

    // Tablo bulunamadı hatası normal, bağlantı var demektir
    if (error && !error.message.includes('relation') && !error.message.includes('PGRST116')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database bağlantı testi hatası:', error);
    return false;
  }
}