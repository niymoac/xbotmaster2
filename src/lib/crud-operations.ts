import { createPostgrestClient } from "./postgrest";
import { validateEnv } from "./api-utils";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: "asc" | "desc";
  };
  select?: string[];
}

/**
 * PostgREST ile CRUD işlemleri için utility class
 */
export default class CrudOperations {
  constructor(
    private tableName: string, 
    private token?: string
  ) {
    if (!tableName) {
      throw new Error('Tablo adı gerekli');
    }
  }

  private get client() {
    return createPostgrestClient(this.token);
  }

  /**
   * Çoklu kayıt getirme (filtreleme, sıralama, sayfalama ile)
   */
  async findMany(
    filters?: Record<string, any>,
    options?: QueryOptions,
  ) {
    try {
      validateEnv();
      
      const { limit = 10, offset = 0, orderBy, select } = options || {};

      let query = this.client
        .from(this.tableName)
        .select(select ? select.join(',') : '*');

      // Filtreler uygula
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.like(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Sıralama uygula
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.direction === "asc",
        });
      }

      // Sayfalama uygula
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`${this.tableName} getirme hatası:`, error);
        throw new Error(`${this.tableName} getirilemedi: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('FindMany hatası:', error);
      throw error;
    }
  }

  /**
   * ID ile tek kayıt getirme
   */
  async findById(id: string | number) {
    try {
      validateEnv();

      const { data, error } = await this.client
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Kayıt bulunamadı
        }
        console.error(`${this.tableName} ID ile getirme hatası:`, error);
        throw new Error(`${this.tableName} ID ile getirilemedi: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('FindById hatası:', error);
      throw error;
    }
  }

  /**
   * Tek kayıt getirme (özel koşullar ile)
   */
  async findOne(filters: Record<string, any>) {
    try {
      const results = await this.findMany(filters, { limit: 1 });
      return results?.[0] || null;
    } catch (error) {
      console.error('FindOne hatası:', error);
      throw error;
    }
  }

  /**
   * Yeni kayıt oluşturma
   */
  async create(data: Record<string, any>) {
    try {
      validateEnv();

      // Timestamp'leri ekle
      const createData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert([createData])
        .select()
        .single();

      if (error) {
        console.error(`${this.tableName} oluşturma hatası:`, error);
        throw new Error(`${this.tableName} oluşturulamadı: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('Create hatası:', error);
      throw error;
    }
  }

  /**
   * Kayıt güncelleme
   */
  async update(id: string | number, data: Record<string, any>) {
    try {
      validateEnv();

      // Update timestamp'i ekle
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`${this.tableName} güncelleme hatası:`, error);
        throw new Error(`${this.tableName} güncellenemedi: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('Update hatası:', error);
      throw error;
    }
  }

  /**
   * Kayıt silme
   */
  async delete(id: string | number) {
    try {
      validateEnv();

      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`${this.tableName} silme hatası:`, error);
        throw new Error(`${this.tableName} silinemedi: ${error.message}`);
      }

      return { id, deleted: true };
    } catch (error) {
      console.error('Delete hatası:', error);
      throw error;
    }
  }

  /**
   * Kayıt sayısını getir
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      validateEnv();

      let query = this.client
        .from(this.tableName)
        .select("*", { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        console.error(`${this.tableName} sayım hatası:`, error);
        throw new Error(`${this.tableName} sayılamadı: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Count hatası:', error);
      throw error;
    }
  }

  /**
   * Bulk insert işlemi
   */
  async createMany(dataArray: Record<string, any>[]) {
    try {
      validateEnv();

      const timestamp = new Date().toISOString();
      const createDataArray = dataArray.map(data => ({
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      }));

      const { data: results, error } = await this.client
        .from(this.tableName)
        .insert(createDataArray)
        .select();

      if (error) {
        console.error(`${this.tableName} bulk oluşturma hatası:`, error);
        throw new Error(`${this.tableName} bulk oluşturulamadı: ${error.message}`);
      }

      return results || [];
    } catch (error) {
      console.error('CreateMany hatası:', error);
      throw error;
    }
  }
}