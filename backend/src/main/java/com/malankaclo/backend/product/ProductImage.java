package com.malankaclo.backend.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    protected ProductImage() {
    }

    public ProductImage(String url, String altText, Integer sortOrder) {
        this.url = url;
        this.altText = altText;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getUrl() { return url; }
    public String getAltText() { return altText; }
    public Integer getSortOrder() { return sortOrder; }

    void setProduct(Product product) { this.product = product; }
    public void setUrl(String url) { this.url = url; }
    public void setAltText(String altText) { this.altText = altText; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
