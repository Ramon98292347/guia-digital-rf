export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accommodation_amenities: {
        Row: {
          accommodation_id: string
          amenity_id: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          accommodation_id: string
          amenity_id: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          accommodation_id?: string
          amenity_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_amenities_tenant_id_accommodation_id_fkey"
            columns: ["tenant_id", "accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "accommodation_amenities_tenant_id_amenity_id_fkey"
            columns: ["tenant_id", "amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "accommodation_amenities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_media: {
        Row: {
          accommodation_id: string
          created_at: string
          id: string
          is_cover: boolean
          media_id: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          accommodation_id: string
          created_at?: string
          id?: string
          is_cover?: boolean
          media_id: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          accommodation_id?: string
          created_at?: string
          id?: string
          is_cover?: boolean
          media_id?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_media_tenant_id_accommodation_id_fkey"
            columns: ["tenant_id", "accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "accommodation_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_media_tenant_id_media_id_fkey"
            columns: ["tenant_id", "media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      accommodation_rules: {
        Row: {
          accommodation_id: string
          created_at: string
          id: string
          rule_id: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          accommodation_id: string
          created_at?: string
          id?: string
          rule_id: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          accommodation_id?: string
          created_at?: string
          id?: string
          rule_id?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_rules_tenant_id_accommodation_id_fkey"
            columns: ["tenant_id", "accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "accommodation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_rules_tenant_id_rule_id_fkey"
            columns: ["tenant_id", "rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      accommodations: {
        Row: {
          area_m2: number | null
          booking_url: string | null
          bed_description: string | null
          capacity: number | null
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          short_description: string | null
          slug: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          view_description: string | null
        }
        Insert: {
          booking_url?: string | null
          area_m2?: number | null
          bed_description?: string | null
          capacity?: number | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          view_description?: string | null
        }
        Update: {
          area_m2?: number | null
          bed_description?: string | null
          booking_url?: string | null
          capacity?: number | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          view_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_tenant_id_cover_media_id_fkey"
            columns: ["tenant_id", "cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "accommodations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          button_label: string | null
          created_at: string
          external_url: string | null
          is_active: boolean
          open_mode: string
          provider: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          button_label?: string | null
          created_at?: string
          external_url?: string | null
          is_active?: boolean
          open_mode?: string
          provider?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          button_label?: string | null
          created_at?: string
          external_url?: string | null
          is_active?: boolean
          open_mode?: string
          provider?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_type: string
          created_at: string
          description: string | null
          id: string
          is_emergency: boolean
          is_primary: boolean
          label: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
          value: string
        }
        Insert: {
          contact_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_emergency?: boolean
          is_primary?: boolean
          label: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
          value: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_emergency?: boolean
          is_primary?: boolean
          label?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_collections: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          kind: string
          slug: string
          sort_order: number
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          kind: string
          slug: string
          sort_order?: number
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          kind?: string
          slug?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_collections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_accommodations: {
        Row: {
          accommodation_id: string
          content_item_id: string
          created_at: string
          id: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          accommodation_id: string
          content_item_id: string
          created_at?: string
          id?: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          accommodation_id?: string
          content_item_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_accommodations_tenant_id_accommodation_id_fkey"
            columns: ["tenant_id", "accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "content_item_accommodations_tenant_id_content_item_id_fkey"
            columns: ["tenant_id", "content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "content_item_accommodations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_media: {
        Row: {
          content_item_id: string
          created_at: string
          id: string
          media_id: string
          role: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          id?: string
          media_id: string
          role?: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          id?: string
          media_id?: string
          role?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_item_media_tenant_id_content_item_id_fkey"
            columns: ["tenant_id", "content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "content_item_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_media_tenant_id_media_id_fkey"
            columns: ["tenant_id", "media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      content_items: {
        Row: {
          alert_text: string | null
          collection_id: string
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          instructions: string | null
          price: number | null
          sort_order: number
          status: string
          subtitle: string | null
          supplier: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_text?: string | null
          collection_id: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          instructions?: string | null
          price?: number | null
          sort_order?: number
          status?: string
          subtitle?: string | null
          supplier?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_text?: string | null
          collection_id?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          instructions?: string | null
          price?: number | null
          sort_order?: number
          status?: string
          subtitle?: string | null
          supplier?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_tenant_id_collection_id_fkey"
            columns: ["tenant_id", "collection_id"]
            isOneToOne: false
            referencedRelation: "content_collections"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "content_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          caption: string | null
          category_id: string | null
          created_at: string
          id: string
          is_featured: boolean
          media_id: string
          sort_order: number
          status: string
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          media_id: string
          sort_order?: number
          status?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          media_id?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_tenant_id_category_id_fkey"
            columns: ["tenant_id", "category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "gallery_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_tenant_id_media_id_fkey"
            columns: ["tenant_id", "media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      local_tip_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_tip_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      local_tips: {
        Row: {
          address: string | null
          category_id: string | null
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          distance_text: string | null
          id: string
          instagram: string | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours_text: string | null
          phone: string | null
          recommended: boolean
          short_description: string | null
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          distance_text?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours_text?: string | null
          phone?: string | null
          recommended?: boolean
          short_description?: string | null
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          distance_text?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours_text?: string | null
          phone?: string | null
          recommended?: boolean
          short_description?: string | null
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_tips_tenant_id_category_id_fkey"
            columns: ["tenant_id", "category_id"]
            isOneToOne: false
            referencedRelation: "local_tip_categories"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "local_tips_tenant_id_cover_media_id_fkey"
            columns: ["tenant_id", "cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "local_tips_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          duration_seconds: number | null
          height: number | null
          id: string
          media_type: string
          mime_type: string | null
          original_filename: string | null
          size_bytes: number | null
          status: string
          storage_bucket: string
          storage_path: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          height?: number | null
          id?: string
          media_type: string
          mime_type?: string | null
          original_filename?: string | null
          size_bytes?: number | null
          status?: string
          storage_bucket: string
          storage_path: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          height?: number | null
          id?: string
          media_type?: string
          mime_type?: string | null
          original_filename?: string | null
          size_bytes?: number | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_id: string
          id: string
          limit_value: number | null
          plan_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_id: string
          id?: string
          limit_value?: number | null
          plan_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_id?: string
          id?: string
          limit_value?: number | null
          plan_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_featured: boolean
          severity: string
          sort_order: number
          status: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_featured?: boolean
          severity?: string
          sort_order?: number
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_featured?: boolean
          severity?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_periods: {
        Row: {
          closes_at: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          label: string | null
          opens_at: string | null
          schedule_id: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          label?: string | null
          opens_at?: string | null
          schedule_id: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          label?: string | null
          opens_at?: string | null
          schedule_id?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_periods_tenant_id_schedule_id_fkey"
            columns: ["tenant_id", "schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          schedule_type: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          schedule_type: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          schedule_type?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          booking_url: string | null
          contact_action: string | null
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          price_type: string
          requires_booking: boolean
          short_description: string | null
          slug: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          booking_url?: string | null
          contact_action?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          price_type?: string
          requires_booking?: boolean
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          booking_url?: string | null
          contact_action?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          price_type?: string
          requires_booking?: boolean
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_cover_media_id_fkey"
            columns: ["tenant_id", "cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      tenant_branding: {
        Row: {
          accent_color: string | null
          background_color: string | null
          created_at: string
          font_body: string | null
          font_heading: string | null
          foreground_color: string | null
          icon_path: string | null
          logo_path: string | null
          primary_color: string | null
          secondary_color: string | null
          surface_color: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          foreground_color?: string | null
          icon_path?: string | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          surface_color?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          foreground_color?: string | null
          icon_path?: string | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          surface_color?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_design_settings: {
        Row: {
          created_at: string
          design_config: Json
          template_key: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          design_config?: Json
          template_key?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          design_config?: Json
          template_key?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_design_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_domains: {
        Row: {
          created_at: string
          domain_type: string
          hostname: string
          id: string
          is_primary: boolean
          path_prefix: string | null
          status: string
          tenant_id: string
          updated_at: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain_type: string
          hostname: string
          id?: string
          is_primary?: boolean
          path_prefix?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain_type?: string
          hostname?: string
          id?: string
          is_primary?: boolean
          path_prefix?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_overrides: {
        Row: {
          created_at: string
          enabled: boolean
          feature_id: string
          id: string
          limit_value: number | null
          source: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled: boolean
          feature_id: string
          id?: string
          limit_value?: number | null
          source?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_id?: string
          id?: string
          limit_value?: number | null
          source?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_overrides_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_feature_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_home_sections: {
        Row: {
          content_source: string | null
          created_at: string
          enabled: boolean
          id: string
          section_type: string
          settings: Json
          sort_order: number
          style_overrides: Json
          subtitle: string | null
          tenant_id: string
          title: string | null
          updated_at: string
          variant: string | null
        }
        Insert: {
          content_source?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          section_type: string
          settings?: Json
          sort_order?: number
          style_overrides?: Json
          subtitle?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
          variant?: string | null
        }
        Update: {
          content_source?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          section_type?: string
          settings?: Json
          sort_order?: number
          style_overrides?: Json
          subtitle?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_home_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          role: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_modules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          module_id: string
          settings: Json
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          module_id: string
          settings?: Json
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          module_id?: string
          settings?: Json
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_navigation: {
        Row: {
          created_at: string
          destination: string
          destination_type: string
          enabled: boolean
          highlighted: boolean
          icon: string | null
          id: string
          label: string
          position: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          destination_type: string
          enabled?: boolean
          highlighted?: boolean
          icon?: string | null
          id?: string
          label: string
          position?: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          destination_type?: string
          enabled?: boolean
          highlighted?: boolean
          icon?: string | null
          id?: string
          label?: string
          position?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_navigation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_pwa_settings: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          enabled: boolean
          install_prompt_enabled: boolean
          name: string | null
          offline_enabled: boolean
          short_name: string | null
          tenant_id: string
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          install_prompt_enabled?: boolean
          name?: string | null
          offline_enabled?: boolean
          short_name?: string | null
          tenant_id: string
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          install_prompt_enabled?: boolean
          name?: string | null
          offline_enabled?: boolean
          short_name?: string | null
          tenant_id?: string
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_pwa_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          settings: Json
          tenant_id: string
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          settings?: Json
          tenant_id: string
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          settings?: Json
          tenant_id?: string
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan_id: string
          starts_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id: string
          starts_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id?: string
          starts_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          currency: string
          id: string
          locale: string
          name: string
          published_at: string | null
          slug: string
          status: string
          timezone: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          locale?: string
          name: string
          published_at?: string | null
          slug: string
          status?: string
          timezone?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          locale?: string
          name?: string
          published_at?: string | null
          slug?: string
          status?: string
          timezone?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      wifi_networks: {
        Row: {
          accommodation_id: string | null
          area: string | null
          created_at: string
          created_by: string | null
          id: string
          is_guest_visible: boolean
          name: string
          password: string | null
          sort_order: number
          ssid: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accommodation_id?: string | null
          area?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_guest_visible?: boolean
          name: string
          password?: string | null
          sort_order?: number
          ssid: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accommodation_id?: string | null
          area?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_guest_visible?: boolean
          name?: string
          password?: string | null
          sort_order?: number
          ssid?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_networks_tenant_id_accommodation_id_fkey"
            columns: ["tenant_id", "accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "wifi_networks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      resolve_tenant: {
        Args: { p_hostname: string; p_pathname?: string }
        Returns: {
          canonical_hostname: string
          domain_type: string
          locale: string
          name: string
          path_prefix: string
          slug: string
          status: string
          tenant_id: string
          timezone: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
